import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState('');

  const strength = () => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const s = strength();
  const strengthColors = ['', '#F87171', '#FB923C', '#4F9CF9', '#34D399'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await register(form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/review');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#030508',
      display: 'flex', fontFamily: "'Outfit', sans-serif",
      backgroundImage: `
        radial-gradient(ellipse 60% 50% at 100% 50%, rgba(37,99,235,0.06) 0%, transparent 60%),
        radial-gradient(ellipse 50% 40% at 0% 50%, rgba(124,58,237,0.04) 0%, transparent 60%)
      `,
    }}>

      {/* Form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400 }} className="fade-up">

          <div style={{ marginBottom: 36 }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 28 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg,#2563EB,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚡</div>
              <span style={{ fontWeight: 800, fontSize: 15, background: 'linear-gradient(135deg,#4F9CF9,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CodeReview.ai</span>
            </Link>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', letterSpacing: -1, marginBottom: 6 }}>Create account</h1>
            <p style={{ fontSize: 14, color: '#64748B' }}>Start catching bugs with AI today</p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)',
              borderLeft: '3px solid #F87171', color: '#FCA5A5',
              borderRadius: '0 8px 8px 0', padding: '10px 14px',
              fontSize: 13, marginBottom: 20,
            }}>⚠ {error}</div>
          )}

          <form onSubmit={handleSubmit}>
            {[
              { key: 'username', label: 'Username', type: 'text', placeholder: 'johndoe' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: 1,
                  textTransform: 'uppercase', marginBottom: 8, transition: 'color 0.2s',
                  color: focused === key ? '#4F9CF9' : '#64748B',
                  fontFamily: "'JetBrains Mono',monospace",
                }}>{label}</label>
                <input
                  type={type} placeholder={placeholder}
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  onFocus={() => setFocused(key)} onBlur={() => setFocused('')}
                  required
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 8, fontSize: 14,
                    background: focused === key ? '#0A1020' : '#060A12',
                    border: `1px solid ${focused === key ? 'rgba(79,156,249,0.4)' : 'rgba(255,255,255,0.07)'}`,
                    color: '#F1F5F9', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
                    boxShadow: focused === key ? '0 0 0 3px rgba(79,156,249,0.07)' : 'none',
                  }}
                />
              </div>
            ))}

            {/* Password field */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: 1,
                textTransform: 'uppercase', marginBottom: 8, transition: 'color 0.2s',
                color: focused === 'password' ? '#4F9CF9' : '#64748B',
                fontFamily: "'JetBrains Mono',monospace",
              }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                  required
                  style={{
                    width: '100%', padding: '12px 44px 12px 16px', borderRadius: 8, fontSize: 14,
                    background: focused === 'password' ? '#0A1020' : '#060A12',
                    border: `1px solid ${focused === 'password' ? 'rgba(79,156,249,0.4)' : 'rgba(255,255,255,0.07)'}`,
                    color: '#F1F5F9', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
                    boxShadow: focused === 'password' ? '0 0 0 3px rgba(79,156,249,0.07)' : 'none',
                  }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 15, padding: 2,
                }}>{showPass ? '🙈' : '👁'}</button>
              </div>
              {form.password && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 2, borderRadius: 1,
                        background: i <= s ? strengthColors[s] : 'rgba(255,255,255,0.06)',
                        transition: 'background 0.3s',
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 11, color: strengthColors[s], fontFamily: "'JetBrains Mono',monospace" }}>
                    {strengthLabels[s]} password
                  </span>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', borderRadius: 8, fontSize: 15, fontWeight: 700,
              background: loading ? 'rgba(37,99,235,0.6)' : 'linear-gradient(135deg,#2563EB,#7C3AED)',
              color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 0 30px rgba(79,156,249,0.2)',
              transition: 'box-shadow 0.2s',
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 0 40px rgba(79,156,249,0.35)'; }}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(79,156,249,0.2)'}
            >
              {loading ? <><span className="spinner" />Creating account...</> : 'Create account →'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ fontSize: 12, color: '#334155', fontFamily: "'JetBrains Mono',monospace" }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <button
            onClick={() => window.location.href = 'http://localhost:5000/api/github/login'}
            style={{
              width: '100%', padding: '12px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)',
              color: '#CBD5E0', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; }}
          >
            <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Sign up with GitHub
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#334155', marginTop: 24 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#4F9CF9', fontWeight: 600 }}>Sign in →</Link>
          </p>
        </div>
      </div>

      {/* Right decorative panel */}
      <div style={{
        flex: 1, display: 'flex', padding: 48, flexDirection: 'column', justifyContent: 'center',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(8,13,22,0.4)',
        gap: 20,
      }} className="hide-mobile">

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: '#4F9CF9', marginBottom: 16, letterSpacing: 2 }}>// what you get</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', letterSpacing: -1, lineHeight: 1.2 }}>
            AI that actually<br />understands code
          </h2>
        </div>

        {[
          { icon: '🎯', title: 'Precise bug detection', desc: 'Not just linting — real logical and security bugs found' },
          { icon: '⚡', title: 'Under 5 seconds', desc: 'Groq LPU runs LLaMA 3.3 70B at 500+ tokens/sec' },
          { icon: '🔐', title: 'Security analysis', desc: 'SQL injection, XSS, hardcoded secrets and more' },
          { icon: '🔄', title: 'Ready-to-use fixes', desc: 'Refactored code suggestions you can copy instantly' },
        ].map(({ icon, title, desc }, i) => (
          <div key={i} style={{
            display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 10,
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
            transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(79,156,249,0.2)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
          >
            <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9', marginBottom: 3 }}>{title}</div>
              <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}