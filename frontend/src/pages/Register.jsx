import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState('');

  const getPasswordStrength = () => {
    const password = form.password;

    if (!password) return 0;

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
  };

  const passwordStrength = getPasswordStrength();

  const strengthColors = [
    '',
    'var(--danger)',
    'var(--orange)',
    'var(--brand-primary)',
    'var(--success)',
  ];

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const { data } = await register(form);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));

      navigate('/review');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const featureCards = [
    {
      icon: '🎯',
      title: 'Precise detection',
      desc: 'Find bugs and quality issues beyond basic linting.',
      accent: 'var(--brand-primary)',
      tint: 'var(--brand-tint-10)',
    },
    {
      icon: '⚡',
      title: 'Fast analysis',
      desc: 'Get quick AI feedback for faster reviews.',
      accent: 'var(--orange)',
      tint: 'var(--orange-tint-10)',
    },
    {
      icon: '🔐',
      title: 'Security checks',
      desc: 'Detect risky patterns and unsafe logic.',
      accent: 'var(--success)',
      tint: 'var(--success-tint-10)',
    },
    {
      icon: '🛠️',
      title: 'Actionable fixes',
      desc: 'Get cleaner suggestions and refactor ideas.',
      accent: 'var(--brand-purple-soft)',
      tint: 'var(--purple-tint-10)',
    },
  ];

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 72px)',
        background: 'var(--bg-page)',
        display: 'flex',
        fontFamily: "'Outfit', sans-serif",
        backgroundImage: `
          radial-gradient(ellipse 60% 50% at 100% 50%, var(--brand-tint-06) 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 0% 50%, var(--purple-tint-04) 0%, transparent 60%)
        `,
      }}
    >
      {/* LEFT FORM SECTION */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '18px 24px',
          boxSizing: 'border-box',
        }}
      >
        <div
          className="fade-up"
          style={{
            width: '100%',
            maxWidth: 400,
          }}
        >
          {/* PAGE HEADER */}
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 12px',
                borderRadius: 999,
                background: 'var(--brand-tint-08)',
                border: '1px solid var(--brand-tint-20)',
                color: 'var(--brand-primary)',
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: 0.3,
                marginBottom: 12,
              }}
            >
              <span>✦</span>
              Secure AI review signup
            </div>

            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: 'var(--text-heading)',
                letterSpacing: -1,
                margin: '0 0 6px',
              }}
            >
              Create account
            </h1>

            <p
              style={{
                fontSize: 13.5,
                color: 'var(--text-muted)',
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Start catching bugs, security issues, and refactoring opportunities with AI.
            </p>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div
              style={{
                background: 'var(--danger-tint-06)',
                border: '1px solid var(--danger-tint-20)',
                borderLeft: '3px solid var(--danger)',
                color: 'var(--danger-text)',
                borderRadius: '0 8px 8px 0',
                padding: '9px 13px',
                fontSize: 13,
                marginBottom: 13,
              }}
            >
              ⚠ {error}
            </div>
          )}

          {/* REGISTER FORM */}
          <form onSubmit={handleSubmit}>
            {/* USERNAME */}
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  marginBottom: 7,
                  color: focused === 'username' ? 'var(--brand-primary)' : 'var(--text-muted)',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                Username
              </label>

              <input
                type="text"
                placeholder="johndoe"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                onFocus={() => setFocused('username')}
                onBlur={() => setFocused('')}
                required
                style={{
                  width: '100%',
                  padding: '11px 15px',
                  borderRadius: 8,
                  fontSize: 14,
                  background: 'var(--bg-card)',
                  border: `1px solid ${
                    focused === 'username' ? 'var(--brand-tint-40)' : 'var(--border)'
                  }`,
                  color: 'var(--text-primary)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  boxShadow:
                    focused === 'username' ? '0 0 0 3px var(--brand-tint-07)' : 'none',
                }}
              />
            </div>

            {/* EMAIL */}
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  marginBottom: 7,
                  color: focused === 'email' ? 'var(--brand-primary)' : 'var(--text-muted)',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                Email
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused('')}
                required
                style={{
                  width: '100%',
                  padding: '11px 15px',
                  borderRadius: 8,
                  fontSize: 14,
                  background: 'var(--bg-card)',
                  border: `1px solid ${
                    focused === 'email' ? 'var(--brand-tint-40)' : 'var(--border)'
                  }`,
                  color: 'var(--text-primary)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  boxShadow: focused === 'email' ? '0 0 0 3px var(--brand-tint-07)' : 'none',
                }}
              />
            </div>

            {/* PASSWORD */}
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  marginBottom: 7,
                  color:
                    focused === 'password' ? 'var(--brand-primary)' : 'var(--text-muted)',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                Password
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused('')}
                  required
                  style={{
                    width: '100%',
                    padding: '11px 44px 11px 15px',
                    borderRadius: 8,
                    fontSize: 14,
                    background: 'var(--bg-card)',
                    border: `1px solid ${
                      focused === 'password' ? 'var(--brand-tint-40)' : 'var(--border)'
                    }`,
                    color: 'var(--text-primary)',
                    outline: 'none',
                    boxSizing: 'border-box',
                    boxShadow:
                      focused === 'password' ? '0 0 0 3px var(--brand-tint-07)' : 'none',
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-faint)',
                    cursor: 'pointer',
                    fontSize: 15,
                  }}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>

              {/* PASSWORD STRENGTH */}
              {form.password && (
                <div style={{ marginTop: 8 }}>
                  <div
                    style={{
                      display: 'flex',
                      gap: 4,
                      marginBottom: 5,
                    }}
                  >
                    {[1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        style={{
                          flex: 1,
                          height: 2,
                          borderRadius: 1,
                          background:
                            item <= passwordStrength
                              ? strengthColors[passwordStrength]
                              : 'var(--border-soft)',
                        }}
                      />
                    ))}
                  </div>

                  <span
                    style={{
                      fontSize: 11,
                      color: strengthColors[passwordStrength],
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {strengthLabels[passwordStrength]} password
                  </span>
                </div>
              )}
            </div>

            {/* CREATE ACCOUNT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 9,
                fontSize: 15,
                fontWeight: 800,
                background: loading
                  ? 'var(--brand-glow-strong)'
                  : 'linear-gradient(135deg,var(--brand-blue),var(--brand-purple))',
                color: 'white',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 12px 30px var(--brand-tint-25)',
              }}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Creating account...
                </>
              ) : (
                'Create account →'
              )}
            </button>
          </form>

          {/* DIVIDER */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              margin: '14px 0',
            }}
          >
            <div style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} />
            <span
              style={{
                fontSize: 12,
                color: 'var(--text-faint)',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              or
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} />
          </div>

          {/* GITHUB BUTTON */}
          <button
            onClick={() => {
              window.location.href = 'http://localhost:5000/api/github/login';
            }}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: 9,
              fontSize: 14,
              fontWeight: 700,
              background: 'var(--surface-03)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Sign up with GitHub
          </button>

          {/* SIGN IN LINK */}
          <p
            style={{
              textAlign: 'center',
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--text-muted)',
              margin: '15px 0 0',
            }}
          >
            Coming Back?{' '}
            <Link
              to="/login"
              style={{
                color: 'var(--brand-primary)',
                fontSize: 16,
                fontWeight: 900,
                textDecoration: 'none',
                borderBottom: '2px solid var(--brand-primary)',
                paddingBottom: 2,
                textShadow: '0 0 14px var(--brand-tint-20)',
              }}
            >
              Sign in →
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT FEATURE SECTION */}
      <div
        className="hide-mobile"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '30px 42px',
          boxSizing: 'border-box',
          borderLeft: '1px solid var(--border-soft)',
          background: `
            linear-gradient(145deg, var(--card-alpha), var(--surface-03)),
            radial-gradient(circle at 20% 15%, var(--brand-tint-10), transparent 34%),
            radial-gradient(circle at 95% 85%, var(--purple-tint-10), transparent 34%)
          `,
        }}
      >
        <div
          style={{
            maxWidth: 460,
            width: '100%',
          }}
        >
          {/* PLATFORM FEATURE BADGE */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 16px',
              borderRadius: 999,
              background: 'linear-gradient(135deg, var(--surface-08), var(--surface-03))',
              border: '1px solid var(--brand-tint-25)',
              boxShadow: '0 8px 24px var(--shadow)',
              marginBottom: 16,
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--brand-blue), var(--brand-purple))',
                boxShadow: '0 0 14px var(--brand-tint-25)',
              }}
            />

            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 1.8,
                textTransform: 'uppercase',
                color: 'var(--text-heading)',
              }}
            >
              Platform Features
            </span>
          </div>

          <h2
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: 'var(--text-heading)',
              letterSpacing: -1.2,
              lineHeight: 1.12,
              margin: '0 0 10px',
            }}
          >
            Built for cleaner,
            <br />
            safer code reviews
          </h2>

          <p
            style={{
              fontSize: 14,
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              maxWidth: 410,
              margin: '0 0 22px',
            }}
          >
            A focused review workspace with detection, security checks, and practical fixes in one place.
          </p>

          {/* FEATURE CARDS */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 13,
            }}
          >
            {featureCards.map((card, index) => (
              <div
                key={index}
                style={{
                  minHeight: 158,
                  padding: 15,
                  borderRadius: 18,
                  background: `
                    linear-gradient(160deg, var(--bg-card), var(--surface-03)),
                    radial-gradient(circle at 15% 12%, ${card.tint}, transparent 52%)
                  `,
                  border: '1px solid var(--border-strong)',
                  boxShadow: '0 12px 30px var(--shadow), inset 0 1px 0 var(--surface-10)',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: `linear-gradient(90deg, ${card.accent}, transparent 75%)`,
                  }}
                />

                <div>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: card.tint,
                      border: '1px solid var(--border-strong)',
                      fontSize: 17,
                      marginBottom: 12,
                    }}
                  >
                    {card.icon}
                  </div>

                  <h3
                    style={{
                      fontSize: 14.5,
                      fontWeight: 800,
                      color: 'var(--text-heading)',
                      margin: '0 0 6px',
                    }}
                  >
                    {card.title}
                  </h3>

                  <p
                    style={{
                      fontSize: 12.2,
                      color: 'var(--text-muted)',
                      lineHeight: 1.45,
                      margin: 0,
                    }}
                  >
                    {card.desc}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 6,
                    alignItems: 'center',
                    marginTop: 14,
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 3,
                      borderRadius: 999,
                      background: card.accent,
                    }}
                  />
                  <span
                    style={{
                      flex: 1,
                      height: 3,
                      borderRadius: 999,
                      background: 'var(--border-soft)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
