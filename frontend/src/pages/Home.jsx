import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const WORDS = ['JavaScript', 'Python', 'Java', 'TypeScript', 'C++', 'Go', 'Rust', 'Kotlin'];

const BUGS = [
  { type: 'SQL Injection', line: 4, severity: 'critical', code: 'query = "SELECT * FROM users WHERE id = " + userId' },
  { type: 'Null Pointer', line: 12, severity: 'high', code: 'return user.getName().toUpperCase()' },
  { type: 'Memory Leak', line: 23, severity: 'high', code: 'setInterval(() => fetchData(), 1000)' },
  { type: 'XSS Vulnerability', line: 31, severity: 'critical', code: 'innerHTML = userInput' },
];

const STEPS = [
  { num: '01', icon: '📋', title: 'Paste your code', desc: 'Drop any language — Python, JS, Java, C++ and more' },
  { num: '02', icon: '🧠', title: 'AI scans every line', desc: 'LLaMA 3.3 70B powered by Groq LPU in seconds' },
  { num: '03', icon: '🎯', title: 'Get precise fixes', desc: 'Severity-tagged bugs with refactored code ready to use' },
];

export default function Home() {
  const [wordIdx, setWordIdx] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [activeBug, setActiveBug] = useState(0);
  const [scanLine, setScanLine] = useState(0);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  // Typing animation
  useEffect(() => {
    const word = WORDS[wordIdx];
    if (!deleting && text.length < word.length) {
      const t = setTimeout(() => setText(word.slice(0, text.length + 1)), 120);
      return () => clearTimeout(t);
    }
    if (!deleting && text.length === word.length) {
      const t = setTimeout(() => setDeleting(true), 1800);
      return () => clearTimeout(t);
    }
    if (deleting && text.length > 0) {
      const t = setTimeout(() => setText(word.slice(0, text.length - 1)), 55);
      return () => clearTimeout(t);
    }
    if (deleting && text.length === 0) {
      setDeleting(false);
      setWordIdx(i => (i + 1) % WORDS.length);
    }
  }, [text, deleting, wordIdx]);

  // Bug cycle
  useEffect(() => {
    const t = setInterval(() => setActiveBug(i => (i + 1) % BUGS.length), 2800);
    return () => clearInterval(t);
  }, []);

  // Scan line
  useEffect(() => {
    const t = setInterval(() => setScanLine(i => (i + 1) % 12), 400);
    return () => clearInterval(t);
  }, []);

  // Mouse parallax
  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
    });
  };

  const c = {
    bg: '#030508',
    surface: '#080D16',
    surface2: '#0D1420',
    border: 'rgba(255,255,255,0.06)',
    border2: 'rgba(255,255,255,0.1)',
    blue: '#4F9CF9',
    cyan: '#22D3EE',
    purple: '#A78BFA',
    green: '#34D399',
    red: '#F87171',
    orange: '#FB923C',
    text: '#F1F5F9',
    muted: '#64748B',
    muted2: '#334155',
  };

  return (
    <div style={{ background: c.bg, minHeight: '100vh', fontFamily: "'Outfit', sans-serif", color: c.text, overflowX: 'hidden' }}>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        style={{
          minHeight: '100vh', position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* Animated grid background */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(79,156,249,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79,156,249,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`,
          transition: 'transform 0.1s ease',
        }} />

        {/* Radial glow spots */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(79,156,249,0.06) 0%, transparent 70%)',
            top: -200, left: -100,
            transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`,
            transition: 'transform 0.2s ease',
          }} />
          <div style={{
            position: 'absolute', width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 70%)',
            bottom: -100, right: -100,
            transform: `translate(${-mousePos.x * 0.3}px, ${-mousePos.y * 0.3}px)`,
            transition: 'transform 0.2s ease',
          }} />
        </div>

        {/* Corner decorations */}
        <div style={{ position: 'absolute', top: 40, left: 40, zIndex: 1 }}>
          <div style={{ width: 20, height: 20, borderTop: `1px solid ${c.blue}`, borderLeft: `1px solid ${c.blue}`, opacity: 0.5 }} />
        </div>
        <div style={{ position: 'absolute', top: 40, right: 40, zIndex: 1 }}>
          <div style={{ width: 20, height: 20, borderTop: `1px solid ${c.blue}`, borderRight: `1px solid ${c.blue}`, opacity: 0.5 }} />
        </div>
        <div style={{ position: 'absolute', bottom: 40, left: 40, zIndex: 1 }}>
          <div style={{ width: 20, height: 20, borderBottom: `1px solid ${c.blue}`, borderLeft: `1px solid ${c.blue}`, opacity: 0.5 }} />
        </div>
        <div style={{ position: 'absolute', bottom: 40, right: 40, zIndex: 1 }}>
          <div style={{ width: 20, height: 20, borderBottom: `1px solid ${c.blue}`, borderRight: `1px solid ${c.blue}`, opacity: 0.5 }} />
        </div>

        {/* Main content */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '120px 24px 80px', maxWidth: 900, margin: '0 auto' }}>

          {/* Terminal badge */}
          <div className="fade-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '8px 16px', marginBottom: 36,
            background: 'rgba(79,156,249,0.05)',
            border: '1px solid rgba(79,156,249,0.2)',
            borderRadius: 6,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: c.cyan,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.green, animation: 'pulse 2s ease infinite', display: 'inline-block' }} />
            <span style={{ color: c.muted }}>$</span> npx Meridian-ai --model llama-3.3-70b
            <span style={{ color: c.green }}>✓ ready</span>
          </div>



  
          {/* Main headline */}
          <h1 className="fade-up-1" style={{
            fontSize: 'clamp(40px, 7vw, 80px)',
            fontWeight: 800, lineHeight: 1.05, letterSpacing: -3,
            marginBottom: 24, color: '#F8FAFC',
          }}>
            Stop shipping<br />
            <span style={{
              background: `linear-gradient(135deg, ${c.blue} 0%, ${c.cyan} 40%, ${c.purple} 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {text || '\u00A0'}<span style={{ animation: 'blink 1s step-end infinite', display: 'inline', WebkitTextFillColor: c.blue }}>|</span>
            </span>
            <br />bugs
          </h1>

          <p className="fade-up-2" style={{
            fontSize: 18, color: c.muted, maxWidth: 520, margin: '0 auto 48px',
            lineHeight: 1.75, fontWeight: 400,
          }}>
            Paste your code. Our AI reviews every line, catches bugs, scores severity, and hands you the fix — in under 5 seconds.
          </p>

          {/* CTAs */}
          <div className="fade-up-3" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 72 }}>
            <Link to="/register" style={{
              padding: '14px 32px', borderRadius: 8, fontSize: 16, fontWeight: 700,
              background: `linear-gradient(135deg, #2563EB, #7C3AED)`,
              color: 'white', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 0 40px rgba(79,156,249,0.2)',
              position: 'relative', overflow: 'hidden',
            }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 60px rgba(79,156,249,0.35)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 40px rgba(79,156,249,0.2)'}
            >
              Start reviewing free
              <span style={{ fontSize: 18 }}>→</span>
            </Link>
            <Link to="/login" style={{
              padding: '13px 32px', borderRadius: 8, fontSize: 16, fontWeight: 600,
              background: 'rgba(255,255,255,0.03)',
              color: c.muted, textDecoration: 'none',
              border: `1px solid ${c.border2}`,
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = c.text; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = c.muted; e.currentTarget.style.borderColor = c.border2; }}
            >
              Sign in
            </Link>
          </div>

          {/* Stats row */}
          <div className="fade-up-4" style={{ display: 'flex', gap: 0, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { val: '< 5s', label: 'avg review time' },
              { val: '10+', label: 'languages supported' },
              { val: '3', label: 'severity levels' },
              { val: '100%', label: 'ai powered' },
            ].map(({ val, label }, i) => (
              <div key={i} style={{
                padding: '0 32px',
                borderRight: i < 3 ? `1px solid ${c.border}` : 'none',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, color: c.blue }}>{val}</div>
                <div style={{ fontSize: 12, color: c.muted, marginTop: 4, letterSpacing: 0.5 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, animation: 'fadeUp 1s 1s ease both' }}>
          <span style={{ fontSize: 11, color: c.muted2, letterSpacing: 2, textTransform: 'uppercase' }}>scroll</span>
          <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom, ${c.muted2}, transparent)` }} />
        </div>
      </section>

      {/* ── LIVE DEMO SECTION ── */}
      <section style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: c.blue, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}></div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: -1.5, color: '#F8FAFC' }}>
            Watch it catch bugs<br />in real time
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 20 }}>
          {/* Code panel */}
          <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ background: '#060A12', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${c.border}` }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F87171' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FBBF24' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34D399' }} />
              <span style={{ marginLeft: 8, fontSize: 12, color: c.muted, fontFamily: "'JetBrains Mono',monospace" }}>vulnerable.py</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, background: 'rgba(248,113,113,0.1)', color: '#F87171', border: '1px solid rgba(248,113,113,0.2)', padding: '2px 8px', borderRadius: 4 }}>4 issues found</span>
            </div>
            <div style={{ padding: 20, fontFamily: "'JetBrains Mono',monospace", fontSize: 13, lineHeight: 2 }}>
              {[
                { ln: 1, code: 'import os', color: '#94A3B8', highlight: false },
                { ln: 2, code: '', color: '#94A3B8', highlight: false },
                { ln: 3, code: 'def get_user(user_id):', color: '#7DD3FC', highlight: false },
                { ln: 4, code: '  query = "SELECT * FROM users WHERE id = " + user_id', color: '#FCA5A5', highlight: true, bug: 'SQL Injection' },
                { ln: 5, code: '  return db.execute(query)', color: '#94A3B8', highlight: false },
                { ln: 6, code: '', color: '#94A3B8', highlight: false },
                { ln: 7, code: 'def process(data):', color: '#7DD3FC', highlight: false },
                { ln: 8, code: '  password = "admin123"', color: '#FDE68A', highlight: true, bug: 'Hardcoded secret' },
                { ln: 9, code: '  result = int(data["value"])', color: '#94A3B8', highlight: false },
                { ln: 10, code: '  return 100 / result', color: '#FCA5A5', highlight: true, bug: 'Division by zero' },
              ].map(({ ln, code, color, highlight, bug }) => (
                <div key={ln} style={{
                  display: 'flex', gap: 16, alignItems: 'center',
                  padding: '0 8px', borderRadius: 4, margin: '0 -8px',
                  background: highlight ? 'rgba(248,113,113,0.06)' : 'transparent',
                  borderLeft: highlight ? '2px solid rgba(248,113,113,0.4)' : '2px solid transparent',
                }}>
                  <span style={{ color: c.muted2, minWidth: 20, userSelect: 'none', fontSize: 11 }}>{ln}</span>
                  <span style={{ color, flex: 1 }}>{code || '\u00A0'}</span>
                  {bug && (
                    <span style={{ fontSize: 10, background: 'rgba(248,113,113,0.12)', color: '#F87171', border: '1px solid rgba(248,113,113,0.2)', padding: '1px 6px', borderRadius: 3, whiteSpace: 'nowrap' }}>
                      ⚠ {bug}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Results panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Score */}
            <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 12, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 13, color: c.muted, marginBottom: 4 }}>Security Score</div>
                  <div style={{ fontSize: 40, fontWeight: 800, color: '#F87171', letterSpacing: -2, lineHeight: 1 }}>22</div>
                  <div style={{ fontSize: 12, color: c.muted }}>/ 100 — Critical</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { n: 2, l: 'Critical', c: '#F87171', bg: 'rgba(248,113,113,0.08)' },
                    { n: 1, l: 'High', c: '#FB923C', bg: 'rgba(251,146,60,0.08)' },
                    { n: 1, l: 'Medium', c: '#FBBF24', bg: 'rgba(251,191,36,0.08)' },
                    { n: 0, l: 'Low', c: '#34D399', bg: 'rgba(52,211,153,0.08)' },
                  ].map(({ n, l, c: col, bg }) => (
                    <div key={l} style={{ background: bg, borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: col }}>{n}</div>
                      <div style={{ fontSize: 10, color: c.muted }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: '22%', height: '100%', background: 'linear-gradient(90deg,#991B1B,#F87171)', borderRadius: 2 }} />
              </div>
            </div>

            {/* Bug cards - animated */}
            {BUGS.map((bug, i) => (
              <div key={i} style={{
                background: c.surface, border: `1px solid ${i === activeBug ? 'rgba(248,113,113,0.3)' : c.border}`,
                borderLeft: `3px solid ${i === activeBug ? '#F87171' : c.muted2}`,
                borderRadius: '0 10px 10px 0', padding: 16,
                transition: 'all 0.4s ease',
                transform: i === activeBug ? 'translateX(4px)' : 'translateX(0)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
                    background: bug.severity === 'critical' ? 'rgba(248,113,113,0.1)' : 'rgba(251,146,60,0.1)',
                    color: bug.severity === 'critical' ? '#F87171' : '#FB923C',
                    border: `1px solid ${bug.severity === 'critical' ? 'rgba(248,113,113,0.2)' : 'rgba(251,146,60,0.2)'}`,
                  }}>{bug.severity}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>Line {bug.line}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: c.muted }}>{bug.type}</span>
                </div>
                <code style={{ fontSize: 12, color: '#94A3B8', fontFamily: "'JetBrains Mono',monospace", background: '#060A12', padding: '4px 8px', borderRadius: 4, display: 'block' }}>
                  {bug.code}
                </code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '100px 24px', background: c.surface }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: c.blue, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}></div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: -1.5, color: '#F8FAFC' }}>Three steps to cleaner code</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, position: 'relative' }}>
            {/* Connector line */}
            <div style={{ position: 'absolute', top: 40, left: '16.66%', right: '16.66%', height: 1, background: `linear-gradient(90deg, ${c.border2}, ${c.blue}40, ${c.border2})`, zIndex: 0 }} />
            {STEPS.map((step, i) => (
              <div key={i} style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 24px' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 20, margin: '0 auto 20px',
                  background: 'linear-gradient(135deg, rgba(79,156,249,0.1), rgba(167,139,250,0.1))',
                  border: `1px solid rgba(79,156,249,0.2)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32,
                }}>
                  {step.icon}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: c.blue, marginBottom: 8 }}>{step.num}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#F1F5F9', marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: c.muted, lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES BENTO GRID ── */}
      <section style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: c.blue, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}></div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: -1.5, color: '#F8FAFC' }}>
            Built for developers<br />who care about quality
          </h2>
        </div>

        {/* Bento grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16 }}>
          {/* Big feature */}
          <div style={{
            gridColumn: 'span 7', background: c.surface, border: `1px solid ${c.border}`,
            borderRadius: 16, padding: 32, position: 'relative', overflow: 'hidden',
            transition: 'border-color 0.3s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(79,156,249,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = c.border}
          >
            <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: 'radial-gradient(circle, rgba(79,156,249,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ fontSize: 36, marginBottom: 16 }}>🤖</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: '#F1F5F9', marginBottom: 12 }}>Your own AI microservice</h3>
            <p style={{ fontSize: 15, color: c.muted, lineHeight: 1.7, marginBottom: 20 }}>Powered by a custom Python FastAPI service running LLaMA 3.3 70B via Groq's LPU — not a wrapper around a chat UI.</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['FastAPI', 'LLaMA 3.3', 'Groq LPU', 'Python'].map(tag => (
                <span key={tag} style={{ padding: '4px 10px', borderRadius: 5, fontSize: 12, fontWeight: 600, background: 'rgba(79,156,249,0.08)', color: c.blue, border: '1px solid rgba(79,156,249,0.15)', fontFamily: "'JetBrains Mono',monospace" }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* GitHub */}
          <div style={{
            gridColumn: 'span 5', background: c.surface, border: `1px solid ${c.border}`,
            borderRadius: 16, padding: 28, position: 'relative', overflow: 'hidden',
            transition: 'border-color 0.3s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(167,139,250,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = c.border}
          >
            <div style={{ fontSize: 32, marginBottom: 14 }}>🐙</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F1F5F9', marginBottom: 10 }}>GitHub integration</h3>
            <p style={{ fontSize: 14, color: c.muted, lineHeight: 1.65 }}>Login with GitHub. Browse your repos. Pick any file for instant AI review.</p>
          </div>

          {/* Severity */}
          <div style={{
            gridColumn: 'span 4', background: c.surface, border: `1px solid ${c.border}`,
            borderRadius: 16, padding: 28, transition: 'border-color 0.3s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = c.border}
          >
            <div style={{ fontSize: 32, marginBottom: 14 }}>🎯</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F1F5F9', marginBottom: 10 }}>Severity scoring</h3>
            <p style={{ fontSize: 14, color: c.muted, lineHeight: 1.65 }}>Every bug tagged Critical, High, Medium or Low. Fix what actually matters first.</p>
          </div>

          {/* Diff */}
          <div style={{
            gridColumn: 'span 4', background: c.surface, border: `1px solid ${c.border}`,
            borderRadius: 16, padding: 28, transition: 'border-color 0.3s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(52,211,153,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = c.border}
          >
            <div style={{ fontSize: 32, marginBottom: 14 }}>🔄</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F1F5F9', marginBottom: 10 }}>Side-by-side diff</h3>
            <p style={{ fontSize: 14, color: c.muted, lineHeight: 1.65 }}>Original vs refactored code shown side by side. Copy the fix in one click.</p>
          </div>

          {/* History */}
          <div style={{
            gridColumn: 'span 4', background: c.surface, border: `1px solid ${c.border}`,
            borderRadius: 16, padding: 28, transition: 'border-color 0.3s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(251,146,60,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = c.border}
          >
            <div style={{ fontSize: 32, marginBottom: 14 }}>📜</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F1F5F9', marginBottom: 10 }}>Review history</h3>
            <p style={{ fontSize: 14, color: c.muted, lineHeight: 1.65 }}>Every review saved to your account. Search, revisit and share with your team.</p>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section style={{ padding: '100px 24px 120px', textAlign: 'center' }}>
        <div style={{
          maxWidth: 700, margin: '0 auto',
          background: c.surface, border: `1px solid rgba(79,156,249,0.15)`,
          borderRadius: 24, padding: '72px 48px',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Glow */}
          <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,156,249,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: c.blue, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}></div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: -1.5, color: '#F8FAFC', marginBottom: 16 }}>
            Ready to write<br />cleaner code?
          </h2>
          <p style={{ fontSize: 16, color: c.muted, marginBottom: 36 }}>Join developers who catch bugs before they ship.</p>
          <Link to="/register" style={{
            padding: '15px 40px', borderRadius: 10, fontSize: 17, fontWeight: 700,
            background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
            color: 'white', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10,
            boxShadow: '0 0 50px rgba(79,156,249,0.25)',
            transition: 'box-shadow 0.3s',
          }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 70px rgba(79,156,249,0.4)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 50px rgba(79,156,249,0.25)'}
          >
            Start for free <span style={{ fontSize: 20 }}>→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${c.border}`, padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: c.muted2 }}>
          <span style={{ background: `linear-gradient(135deg,${c.blue},${c.purple})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 }}>Meridian.ai</span>
          {' '}— Built with LLaMA 3.3 70B · FastAPI · React · MongoDB
        </div>
      </footer>
    </div>
  );
}