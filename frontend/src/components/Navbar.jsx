import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import meridianLogo from '../assets/meridian-logo.png';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

  const isActive = (p) => location.pathname === p;

  const c = {
    bg: scrolled ? 'rgba(3,5,8,0.95)' : 'rgba(3,5,8,0.7)',
    border: scrolled ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
    blue: '#4F9CF9',
    purple: '#A78BFA',
    text: '#F1F5F9',
    muted: '#64748B',
  };

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
        height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src={meridianLogo} alt="Meridian.ai" style={{
            width: 30, height: 30, borderRadius: 4, objectFit: 'contain'
          }} />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
            <span style={{
              fontWeight: 800, fontSize: 16, letterSpacing: -0.5,
              background: 'linear-gradient(135deg, #4F9CF9, #A78BFA)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Meridian</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, color: '#4F9CF9', fontWeight: 400 }}>.ai</span>
          </div>
        </Link>

        {/* Desktop */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {token ? (
              <>
                {[
                  { path: '/review', label: 'Review' },
                  { path: '/history', label: 'History' },
                ].map(({ path, label }) => (
                  <Link key={path} to={path} style={{
                    textDecoration: 'none', padding: '6px 14px', borderRadius: 7,
                    fontSize: 14, fontWeight: 500, transition: 'all 0.2s',
                    color: isActive(path) ? '#4F9CF9' : c.muted,
                    background: isActive(path) ? 'rgba(79,156,249,0.08)' : 'transparent',
                    border: isActive(path) ? '1px solid rgba(79,156,249,0.2)' : '1px solid transparent',
                  }}>{label}</Link>
                ))}

                <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.08)', margin: '0 8px' }} />

                {/* User pill */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '4px 10px 4px 5px', borderRadius: 20,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt=""
                      style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg,#2563EB,#7C3AED)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, color: 'white',
                    }}>
                      {(user?.username || user?.githubUsername || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span style={{ fontSize: 13, color: '#CBD5E0', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.username || user?.githubUsername || 'User'}
                  </span>
                </div>

                <button onClick={logout} style={{
                  padding: '6px 14px', borderRadius: 7, fontSize: 13, fontWeight: 500,
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.07)',
                  color: c.muted, cursor: 'pointer', transition: 'all 0.2s', marginLeft: 4,
                }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#F87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.25)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = c.muted; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                >Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" style={{
                  textDecoration: 'none', padding: '7px 16px', borderRadius: 7,
                  fontSize: 14, fontWeight: 500, color: c.muted, transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = c.text}
                  onMouseLeave={e => e.currentTarget.style.color = c.muted}
                >Login</Link>
                <Link to="/register" style={{
                  textDecoration: 'none', padding: '7px 18px', borderRadius: 7,
                  fontSize: 14, fontWeight: 700, marginLeft: 4,
                  background: 'linear-gradient(135deg,#2563EB,#7C3AED)',
                  color: 'white', boxShadow: '0 0 20px rgba(79,156,249,0.2)',
                  transition: 'box-shadow 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(79,156,249,0.35)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(79,156,249,0.2)'}
                >Get started</Link>
              </>
            )}
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button onClick={() => setOpen(!open)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 6, display: 'flex', flexDirection: 'column', gap: 5,
            color: c.muted,
          }}>
            {[0,1,2].map(i => (
              <span key={i} style={{
                display: 'block', width: 18, height: 1.5,
                background: 'currentColor', borderRadius: 2,
                transition: 'all 0.25s ease',
                transform: open && i === 0 ? 'rotate(45deg) translate(4.5px,4.5px)'
                  : open && i === 1 ? 'scaleX(0)' : open && i === 2 ? 'rotate(-45deg) translate(4.5px,-4.5px)' : 'none',
                opacity: open && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>
        )}
      </div>

      {/* Mobile menu */}
      {isMobile && open && (
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(3,5,8,0.98)',
          padding: '14px 24px 20px',
          animation: 'fadeUp 0.2s ease',
        }}>
          {token ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 10 }}>
                {user?.avatar ? (
                  <img src={user.avatar} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#2563EB,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white' }}>
                    {(user?.username || user?.githubUsername || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: c.text }}>{user?.username || user?.githubUsername || 'User'}</div>
                  <div style={{ fontSize: 11, color: c.muted, fontFamily: "'JetBrains Mono',monospace" }}>signed in</div>
                </div>
              </div>
              {[{path:'/review',label:'⚡ Review'},{path:'/history',label:'📜 History'}].map(({path,label})=>(
                <Link key={path} to={path} onClick={()=>setOpen(false)} style={{ display:'block', padding:'10px 0', textDecoration:'none', fontSize:14, color:'#CBD5E0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>{label}</Link>
              ))}
              <button onClick={logout} style={{ display:'block', width:'100%', textAlign:'left', padding:'12px 0', border:'none', background:'none', cursor:'pointer', fontSize:14, color:'#F87171', marginTop:4 }}>→ Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={()=>setOpen(false)} style={{ display:'block', padding:'10px 0', textDecoration:'none', fontSize:14, color:'#CBD5E0' }}>Login</Link>
              <Link to="/register" onClick={()=>setOpen(false)} style={{ display:'block', padding:'11px', borderRadius:8, textDecoration:'none', fontSize:14, fontWeight:700, background:'linear-gradient(135deg,#2563EB,#7C3AED)', color:'white', textAlign:'center', marginTop:8 }}>Get Started Free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}