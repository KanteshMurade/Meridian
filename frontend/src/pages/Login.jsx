import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import meridianLogo from '../assets/meridian-logo.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validateForm = () => {
    if (!form.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!form.password) {
      setError('Password is required');
      return false;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const { data } = await login(form);
      localStorage.setItem('token', data.token);
      navigate('/review');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  const S = {
    page: {
      minHeight: '100vh', background: 'var(--bg-page)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: "'Outfit', sans-serif",
      backgroundImage: `
        radial-gradient(ellipse 80% 60% at 20% 0%, var(--brand-tint-07) 0%, transparent 60%),
        radial-gradient(ellipse 60% 50% at 80% 100%, var(--purple-tint-05) 0%, transparent 60%)
      `,
    },
    wrap: { width: '100%', maxWidth: 420 },
    logoWrap: { textAlign: 'center', marginBottom: 32 },
    logoIcon: {
      width: 44, height: 44, borderRadius: 12,
      background: 'linear-gradient(135deg, var(--brand-blue), var(--brand-purple))',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 22, boxShadow: '0 8px 24px var(--brand-glow)', marginBottom: 12,
    },
    logoText: {
      display: 'block', fontWeight: 800, fontSize: 20,
      background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-purple-soft))',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    },
    card: {
      background: 'var(--panel-alpha)', backdropFilter: 'blur(20px)',
      border: '1px solid var(--border)', borderRadius: 18, padding: '36px 32px',
      boxShadow: 'var(--shadow)',
    },
    heading: { fontSize: 24, fontWeight: 800, color: 'var(--text-heading)', marginBottom: 4, letterSpacing: '-0.5px' },
    sub: { fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 },
    error: {
      background: 'var(--danger-tint-08)', border: '1px solid var(--danger-tint-20)',
      color: 'var(--danger-text)', borderRadius: 10, padding: '10px 14px',
      fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8,
    },
    label: { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 7 },
    input: {
      width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 14,
      background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
      color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
      boxSizing: 'border-box',
    },
    fieldWrap: { marginBottom: 18 },
    passWrap: { position: 'relative' },
    eyeBtn: {
      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
      background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 16, padding: 0,
    },
    btn: {
      width: '100%', padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 700,
      background: 'linear-gradient(135deg, var(--brand-blue), var(--brand-purple))',
      color: 'white', border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      boxShadow: '0 12px 34px var(--brand-tint-30)', marginTop: 8,
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' },
    divLine: { flex: 1, height: 1, background: 'var(--border)' },
    divText: { fontSize: 12, color: 'var(--text-faint)' },
    githubBtn: {
      width: '100%', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 600,
      background: 'var(--surface-04)', border: '1px solid var(--surface-10)',
      color: 'var(--text-secondary)', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      transition: 'all 0.2s',
    },
    foot: { textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-faint)' },
    link: { color: 'var(--brand-primary)', fontWeight: 600 },
  };

  const focusStyle = (e) => {
    e.target.style.borderColor = 'var(--brand-tint-40)';
    e.target.style.boxShadow = '0 0 0 3px var(--brand-tint-08)';
  };
  const blurStyle = (e) => {
    e.target.style.borderColor = 'var(--border-strong)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <main style={S.page}>
      <div style={S.wrap} className="fade-up">
        {/* Logo */}
        <div style={S.logoWrap}>
          <Link to="/">
            <img src={meridianLogo} alt="Meridian.ai" style={{
              width: 60, height: 60, objectFit: 'contain', marginBottom: 12, display: 'block'
            }} />
            <span style={S.logoText}>Meridian.ai</span>
          </Link>
        </div>

        <div style={S.card}>
          <h1 style={S.heading}>Welcome back</h1>
          <p style={S.sub}>Sign in to your account to continue</p>

          {error && <div style={S.error} role="alert" aria-live="assertive">⚠️ {error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div style={S.fieldWrap}>
              <label style={S.label} htmlFor="email-input">Email Address</label>
              <input
                id="email-input"
                type="email" 
                style={S.input} 
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                onFocus={focusStyle} 
                onBlur={blurStyle}
                required
                aria-required="true"
                aria-describedby={error ? 'error-message' : undefined}
              />
            </div>

            <div style={S.fieldWrap}>
              <label style={S.label} htmlFor="password-input">Password</label>
              <div style={S.passWrap}>
                <input
                  id="password-input"
                  type={showPass ? 'text' : 'password'} 
                  style={{ ...S.input, paddingRight: 42 }}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={focusStyle} 
                  onBlur={blurStyle}
                  required
                  aria-required="true"
                  aria-describedby={error ? 'error-message' : undefined}
                />
                <button 
                  type="button" 
                  style={S.eyeBtn} 
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              style={{ ...S.btn, opacity: loading ? 0.7 : 1 }}
              aria-busy={loading}
            >
              {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In →'}
            </button>
          </form>

          <div style={S.divider}>
            <div style={S.divLine} />
            <span style={S.divText}>or continue with</span>
            <div style={S.divLine} />
          </div>

          <button
            style={S.githubBtn}
            onClick={() => window.location.href = `${API_BASE_URL}/github/login`}
            onMouseEnter={e => { e.target.style.background = 'var(--border)'; e.target.style.borderColor = 'var(--surface-15)'; }}
            onMouseLeave={e => { e.target.style.background = 'var(--surface-04)'; e.target.style.borderColor = 'var(--surface-10)'; }}
            aria-label="Sign in with GitHub"
          >
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>

          <p style={S.foot}>
            Don't have an account?{' '}
            <Link to="/register" style={S.link}>Sign up free</Link>
          </p>
        </div>
      </div>
    </main>
  );
}