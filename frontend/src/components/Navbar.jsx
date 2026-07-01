import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import meridianLogo from '../assets/meridian-logo.png';

const getSavedTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  return localStorage.getItem('theme') || 'dark';
};

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [theme, setTheme] = useState(getSavedTheme);

  // Apply selected theme globally and remember it in browser storage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch user profile from backend if token exists
  useEffect(() => {
    if (token && !user) {
      const fetchUser = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/auth/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      };
      fetchUser();
    }
  }, [token, user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onResize);
    return () => { 
      window.removeEventListener('scroll', onScroll); 
      window.removeEventListener('resize', onResize); 
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    setOpen(false);
  };

  const toggleTheme = () => {
    setTheme(currentTheme => currentTheme === 'dark' ? 'light' : 'dark');
  };

  const isActive = (p) => location.pathname === p;

  const c = {
    bg: scrolled ? 'var(--nav-bg-solid)' : 'var(--nav-bg)',
    border: scrolled ? 'var(--border-strong)' : 'var(--surface-04)',
    blue: 'var(--brand-primary)',
    purple: 'var(--brand-purple-soft)',
    text: 'var(--text-primary)',
    muted: 'var(--text-muted)',
  };

  const themeButton = (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '6px 12px', borderRadius: 999,
        fontSize: 13, fontWeight: 800, letterSpacing: 0.15,
        background: 'linear-gradient(135deg, var(--bg-panel), var(--surface-05))',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-strong)',
        boxShadow: '0 10px 26px var(--surface-10)',
        cursor: 'pointer', transition: 'all 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.color = 'var(--brand-primary)';
        e.currentTarget.style.borderColor = 'var(--brand-tint-30)';
        e.currentTarget.style.background = 'var(--brand-tint-10)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = 'var(--text-primary)';
        e.currentTarget.style.borderColor = 'var(--border-strong)';
        e.currentTarget.style.background = 'linear-gradient(135deg, var(--bg-panel), var(--surface-05))';
      }}
    >
      <span style={{ fontSize: 14 }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
      {!isMobile && <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>}
    </button>
  );

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 1000,
      background: c.bg,
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: `1px solid ${c.border}`,
      fontFamily: "'Outfit', sans-serif",
      transition: 'background 0.3s, border-color 0.3s',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 24px',
        height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 13, textDecoration: 'none' }}>
          <span style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--brand-tint-15), var(--purple-tint-10))',
            border: '1px solid var(--brand-tint-30)',
            boxShadow: '0 0 26px var(--brand-tint-25), inset 0 1px 0 var(--surface-15)',
            flexShrink: 0,
          }}>
            <img src={meridianLogo} alt="Meridian.ai" style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 12px var(--brand-glow))',
            }} />
          </span>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
            <span style={{
              fontWeight: 950,
              fontSize: 23,
              letterSpacing: -0.8,
              color: 'var(--text-heading)',
              textShadow: '0 0 18px var(--brand-tint-25)',
              lineHeight: 1,
            }}>
              Meridian
            </span>

            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 18,
              color: 'var(--brand-primary)',
              fontWeight: 900,
              textShadow: '0 0 16px var(--brand-tint-30)',
              lineHeight: 1,
            }}>
              .ai
            </span>
          </div>
        </Link>

        {/* Desktop */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {token ? (
              <>
                {[
                  { path: '/review', label: 'Review', icon: '⚡' },
                  { path: '/history', label: 'History', icon: '📜' },
                ].map(({ path, label, icon }) => {
                  const active = isActive(path);
                  return (
                    <Link
                      key={path}
                      to={path}
                      style={{
                        textDecoration: 'none', padding: '7px 15px', borderRadius: 999,
                        fontSize: 14, fontWeight: 800, letterSpacing: 0.15, transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', gap: 7,
                        color: active ? 'var(--brand-primary)' : 'var(--text-primary)',
                        background: active ? 'var(--brand-tint-10)' : 'var(--surface-04)',
                        border: active ? '1px solid var(--brand-tint-30)' : '1px solid var(--border)',
                        boxShadow: active ? '0 10px 26px var(--brand-tint-15)' : '0 8px 20px var(--surface-05)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = 'var(--brand-primary)';
                        e.currentTarget.style.borderColor = 'var(--brand-tint-40)';
                        e.currentTarget.style.background = 'var(--brand-tint-10)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = active ? 'var(--brand-primary)' : 'var(--text-primary)';
                        e.currentTarget.style.borderColor = active ? 'var(--brand-tint-30)' : 'var(--border)';
                        e.currentTarget.style.background = active ? 'var(--brand-tint-10)' : 'var(--surface-04)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <span style={{ fontSize: 15, lineHeight: 1 }}>{icon}</span>
                      <span>{label}</span>
                    </Link>
                  );
                })}

                <div style={{ width: 1, height: 16, background: 'var(--border-strong)', margin: '0 8px' }} />

                {themeButton}

                {/* User pill */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '4px 10px 4px 5px', borderRadius: 20,
                  background: 'var(--surface-04)',
                  border: '1px solid var(--border)',
                }}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt=""
                      style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg,var(--brand-blue),var(--brand-purple))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, color: 'white',
                    }}>
                      {(user?.username || user?.githubUsername || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.username || user?.githubUsername || 'User'}
                  </span>
                </div>

                <button onClick={logout} style={{
                  padding: '7px 15px', borderRadius: 999, fontSize: 13, fontWeight: 800, letterSpacing: 0.1,
                  background: 'var(--surface-04)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s', marginLeft: 4,
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger-tint-25)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >↗ Logout</button>
              </>
            ) : (
              <>
                {themeButton}
                <Link to="/login" style={{
                  textDecoration: 'none', padding: '8px 17px', borderRadius: 999,
                  fontSize: 14, fontWeight: 800, letterSpacing: 0.15,
                  color: isActive('/login') ? 'var(--brand-primary)' : 'var(--text-primary)',
                  background: isActive('/login') ? 'var(--brand-tint-10)' : 'var(--surface-04)',
                  border: isActive('/login') ? '1px solid var(--brand-tint-30)' : '1px solid var(--border)',
                  boxShadow: '0 8px 22px var(--surface-05)',
                  display: 'flex', alignItems: 'center', gap: 7,
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = 'var(--brand-primary)';
                    e.currentTarget.style.borderColor = 'var(--brand-tint-40)';
                    e.currentTarget.style.background = 'var(--brand-tint-10)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = isActive('/login') ? 'var(--brand-primary)' : 'var(--text-primary)';
                    e.currentTarget.style.borderColor = isActive('/login') ? 'var(--brand-tint-30)' : 'var(--border)';
                    e.currentTarget.style.background = isActive('/login') ? 'var(--brand-tint-10)' : 'var(--surface-04)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                ><span style={{ fontSize: 15, lineHeight: 1 }}>🔐</span><span>Login</span></Link>
                <Link to="/register" style={{
                  textDecoration: 'none', padding: '7px 18px', borderRadius: 7,
                  fontSize: 14, fontWeight: 900, letterSpacing: 0.15, marginLeft: 4,
                  background: 'linear-gradient(135deg,var(--brand-blue),var(--brand-purple))',
                  color: 'white', boxShadow: '0 10px 28px var(--brand-glow)',
                  display: 'flex', alignItems: 'center', gap: 7,
                  transition: 'box-shadow 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 30px var(--brand-glow)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 10px 28px var(--brand-glow)'}
                ><span style={{ fontSize: 15, lineHeight: 1 }}>🚀</span><span>Get started</span></Link>
              </>
            )}
          </div>
        )}

        {/* Mobile controls */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {themeButton}
            <button onClick={() => setOpen(!open)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 6, display: 'flex', flexDirection: 'column', gap: 5,
              color: 'var(--text-primary)',
            }}>
              {[0,1,2].map(i => (
                <span key={i} style={{
                  display: 'block', width: 19, height: 2,
                  background: 'currentColor', borderRadius: 2,
                  transition: 'all 0.25s ease',
                  transform: open && i === 0 ? 'rotate(45deg) translate(4.5px,4.5px)'
                    : open && i === 1 ? 'scaleX(0)' : open && i === 2 ? 'rotate(-45deg) translate(4.5px,-4.5px)' : 'none',
                  opacity: open && i === 1 ? 0 : 1,
                }} />
              ))}
            </button>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {isMobile && open && (
        <div style={{
          borderTop: '1px solid var(--border-soft)',
          background: 'var(--nav-menu-bg)',
          padding: '14px 24px 20px',
          animation: 'fadeUp 0.2s ease',
        }}>
          {token ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0 14px', borderBottom: '1px solid var(--border-soft)', marginBottom: 10 }}>
                {user?.avatar ? (
                  <img src={user.avatar} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,var(--brand-blue),var(--brand-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white' }}>
                    {(user?.username || user?.githubUsername || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: c.text }}>{user?.username || user?.githubUsername || 'User'}</div>
                  <div style={{ fontSize: 11, color: c.muted, fontFamily: "'JetBrains Mono',monospace" }}>signed in</div>
                </div>
              </div>
              {[{path:'/review',label:'⚡ Review'},{path:'/history',label:'📜 History'}].map(({path,label})=>(
                <Link key={path} to={path} onClick={()=>setOpen(false)} style={{ display:'block', padding:'12px 0', textDecoration:'none', fontSize:15, fontWeight:800, color:'var(--text-primary)', borderBottom:'1px solid var(--surface-04)' }}>{label}</Link>
              ))}
              <button onClick={logout} style={{ display:'block', width:'100%', textAlign:'left', padding:'12px 0', border:'none', background:'none', cursor:'pointer', fontSize:14, fontWeight:800, color:'var(--danger)', marginTop:4 }}>→ Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={()=>setOpen(false)} style={{ display:'block', padding:'12px 0', textDecoration:'none', fontSize:15, fontWeight:800, color:'var(--text-primary)' }}>🔐 Login</Link>
              <Link to="/register" onClick={()=>setOpen(false)} style={{ display:'block', padding:'11px', borderRadius:8, textDecoration:'none', fontSize:14, fontWeight:900, background:'linear-gradient(135deg,var(--brand-blue),var(--brand-purple))', color:'white', textAlign:'center', marginTop:8 }}>🚀 Get Started Free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
