import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProfile, getReviews, updateProfile } from '../services/api';

const PRESET_AVATARS = [
  { id: 'avatar-1', icon: '👩‍💻', name: 'Developer', bg: 'linear-gradient(135deg, #2563eb, #7c3aed)' },
  { id: 'avatar-2', icon: '🧑‍💻', name: 'Coder', bg: 'linear-gradient(135deg, #0891b2, #4f46e5)' },
  { id: 'avatar-3', icon: '🤖', name: 'AI Bot', bg: 'linear-gradient(135deg, #7c3aed, #db2777)' },
  { id: 'avatar-4', icon: '🚀', name: 'Builder', bg: 'linear-gradient(135deg, #ea580c, #7c3aed)' },
  { id: 'avatar-5', icon: '🛡️', name: 'Security', bg: 'linear-gradient(135deg, #059669, #2563eb)' },
  { id: 'avatar-6', icon: '✨', name: 'Meridian', bg: 'linear-gradient(135deg, #9333ea, #2563eb)' },
];

const getScoreLabel = (score) => {
  if (score >= 80) return { label: 'Good', color: 'var(--success)', bg: 'var(--success-tint-10)', border: 'var(--success-tint-30)' };
  if (score >= 50) return { label: 'Fair', color: 'var(--warning)', bg: 'var(--warning-tint-10)', border: 'var(--warning-tint-25)' };
  return { label: 'Poor', color: 'var(--danger)', bg: 'var(--danger-tint-10)', border: 'var(--danger-tint-30)' };
};

const formatDate = (value) => {
  if (!value) return 'Not available';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getDisplayName = (user) => {
  return user?.displayName || user?.username || user?.githubUsername || 'User';
};

const getSelectedAvatar = (selectedAvatar) => {
  return PRESET_AVATARS.find((avatar) => avatar.id === selectedAvatar) || PRESET_AVATARS[0];
};

const ProfileAvatar = ({ user, size = 82, radius = 24, fontSize = 34 }) => {
  const isGithubUser = user?.accountType === 'github' || user?.githubConnected;

  if (isGithubUser && user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt="User avatar"
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          objectFit: 'cover',
          border: '2px solid var(--brand-tint-30)',
          boxShadow: '0 16px 38px var(--brand-tint-20)',
          flexShrink: 0,
        }}
      />
    );
  }

  const avatar = getSelectedAvatar(user?.selectedAvatar);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: avatar.bg,
        color: 'white',
        fontSize,
        fontWeight: 950,
        boxShadow: '0 16px 38px var(--brand-glow)',
        border: '2px solid var(--brand-tint-30)',
        flexShrink: 0,
      }}
      title={avatar.name}
    >
      {avatar.icon}
    </div>
  );
};

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: '', bio: '', selectedAvatar: 'avatar-1' });
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    const loadProfileDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const [profileResponse, reviewsResponse] = await Promise.all([
          getProfile(),
          getReviews(),
        ]);

        setProfile(profileResponse.data);
        setEditForm({
          displayName: getDisplayName(profileResponse.data),
          bio: profileResponse.data?.bio || '',
          selectedAvatar: profileResponse.data?.selectedAvatar || 'avatar-1',
        });
        setReviews(Array.isArray(reviewsResponse.data) ? reviewsResponse.data : []);
      } catch (err) {
        console.error('Profile dashboard error:', err);
        setError(err.response?.data?.message || 'Unable to load profile dashboard. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadProfileDashboard();
  }, [navigate]);

  const stats = useMemo(() => {
    const totalReviews = reviews.length;
    const totalScore = reviews.reduce((sum, review) => sum + Number(review.overallScore || 0), 0);
    const averageScore = totalReviews ? Math.round(totalScore / totalReviews) : 0;
    const bestScore = reviews.reduce((best, review) => Math.max(best, Number(review.overallScore || 0)), 0);

    const severityCounts = reviews.reduce(
      (acc, review) => {
        (review.suggestions || []).forEach((suggestion) => {
          const severity = String(suggestion.severity || '').toLowerCase();
          if (severity === 'high') acc.high += 1;
          if (severity === 'medium') acc.medium += 1;
          if (severity === 'low') acc.low += 1;
        });
        return acc;
      },
      { high: 0, medium: 0, low: 0 }
    );

    const scoreBreakdown = reviews.reduce(
      (acc, review) => {
        const score = Number(review.overallScore || 0);
        if (score >= 80) acc.good += 1;
        else if (score >= 50) acc.fair += 1;
        else acc.poor += 1;
        return acc;
      },
      { good: 0, fair: 0, poor: 0 }
    );

    const languageCounts = reviews.reduce((acc, review) => {
      const language = review.language || 'unknown';
      acc[language] = (acc[language] || 0) + 1;
      return acc;
    }, {});

    const topLanguage = Object.entries(languageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Not available';

    const sourceCounts = reviews.reduce((acc, review) => {
      const source = review.sourceType || 'paste';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    const latestReview = reviews[0] || null;

    return {
      totalReviews,
      averageScore,
      bestScore,
      severityCounts,
      scoreBreakdown,
      languageCounts,
      topLanguage,
      sourceCounts,
      latestReview,
    };
  }, [reviews]);

  const openEditProfile = () => {
    setSaveError('');
    setEditForm({
      displayName: getDisplayName(profile),
      bio: profile?.bio || '',
      selectedAvatar: profile?.selectedAvatar || 'avatar-1',
    });
    setEditOpen(true);
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setSaveError('');

      const payload = {
        displayName: editForm.displayName,
        bio: editForm.bio,
      };

      const isGithubUser = profile?.accountType === 'github' || profile?.githubConnected;
      if (!isGithubUser) {
        payload.selectedAvatar = editForm.selectedAvatar;
      }

      const response = await updateProfile(payload);
      setProfile(response.data);
      setEditForm({
        displayName: getDisplayName(response.data),
        bio: response.data?.bio || '',
        selectedAvatar: response.data?.selectedAvatar || 'avatar-1',
      });
      window.dispatchEvent(new Event('meridian-profile-updated'));
      setEditOpen(false);
    } catch (err) {
      console.error('Profile save error:', err);
      setSaveError(err.response?.data?.message || 'Unable to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const averageScoreStyle = getScoreLabel(stats.averageScore);
  const isGithubUser = profile?.accountType === 'github' || profile?.githubConnected;

  const pageStyle = {
    minHeight: 'calc(100vh - 68px)',
    background: 'var(--bg-page)',
    color: 'var(--text-primary)',
    fontFamily: "'Outfit', sans-serif",
    padding: '44px 20px 64px',
    transition: 'background 0.3s, color 0.3s',
  };

  const shellStyle = {
    maxWidth: 1180,
    margin: '0 auto',
  };

  const cardStyle = {
    background: 'linear-gradient(145deg, var(--panel-alpha), var(--card-alpha))',
    border: '1px solid var(--border)',
    borderRadius: 24,
    boxShadow: 'var(--shadow)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  };

  const statCardStyle = {
    ...cardStyle,
    padding: 20,
    minHeight: 120,
    position: 'relative',
    overflow: 'hidden',
  };

  const labelStyle = {
    fontSize: 15,
    color: 'var(--text-muted)',
    fontWeight: 800,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 14,
    border: '1px solid var(--border-strong)',
    background: 'var(--surface-04)',
    color: 'var(--text-primary)',
    fontFamily: "'Outfit', sans-serif",
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
  };

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={{ ...shellStyle, display: 'flex', minHeight: 420, alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...cardStyle, padding: 34, textAlign: 'center', maxWidth: 420 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', border: '3px solid var(--brand-tint-20)', borderTopColor: 'var(--brand-primary)', margin: '0 auto 16px', animation: 'spin 0.9s linear infinite' }} />
            <h2 style={{ margin: 0, fontSize: 24, color: 'var(--text-heading)' }}>Loading profile dashboard...</h2>
            <p style={{ margin: '10px 0 0', color: 'var(--text-muted)' }}>Fetching your account and review activity.</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main style={pageStyle}>
        <div style={{ ...shellStyle, display: 'flex', minHeight: 420, alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...cardStyle, padding: 34, textAlign: 'center', maxWidth: 520, borderColor: 'var(--danger-tint-30)' }}>
            <div style={{ fontSize: 38, marginBottom: 12 }}>⚠️</div>
            <h2 style={{ margin: 0, fontSize: 26, color: 'var(--text-heading)' }}>Profile could not load</h2>
            <p style={{ margin: '12px 0 22px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                padding: '11px 20px', borderRadius: 999, border: '1px solid var(--brand-tint-30)',
                background: 'linear-gradient(135deg,var(--brand-blue),var(--brand-purple))', color: 'white',
                fontWeight: 900, cursor: 'pointer', boxShadow: '0 14px 34px var(--brand-glow)',
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={shellStyle}>
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 360px) 1fr',
          gap: 22,
          alignItems: 'stretch',
        }}>
          <div style={{ ...cardStyle, padding: 26, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: '-40% -30% auto auto', width: 210, height: 210, borderRadius: '50%', background: 'var(--brand-tint-15)', filter: 'blur(30px)' }} />

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
              <ProfileAvatar user={profile} />

              <div style={{ minWidth: 0 }}>
                <div style={{ ...labelStyle, marginBottom: 5 }}>User Profile</div>
                <h1 style={{ margin: 0, fontSize: 23, color: 'var(--text-heading)', letterSpacing: -1, lineHeight: 1.05, wordBreak: 'break-word' }}>
                  {getDisplayName(profile)}
                </h1>
                <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: 14, wordBreak: 'break-word' }}>
                  {profile?.email || 'Email not available'}
                </p>
              </div>
            </div>

            <div style={{ position: 'relative', marginTop: 20, padding: 14, borderRadius: 18, background: 'var(--surface-04)', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-heading)', fontWeight: 950, marginBottom: 6 }}>About</div>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.55 }}>
                {profile?.bio || 'No bio added yet. Click Edit Profile to add a short about section.'}
              </p>
            </div>

            <button
              type="button"
              onClick={openEditProfile}
              style={{
                position: 'relative',
                width: '100%',
                marginTop: 16,
                padding: '11px 16px',
                borderRadius: 999,
                border: '1px solid var(--brand-tint-30)',
                background: 'linear-gradient(135deg,var(--brand-blue),var(--brand-purple))',
                color: 'white',
                fontWeight: 950,
                cursor: 'pointer',
                boxShadow: '0 14px 34px var(--brand-glow)',
              }}
            >
              ✏️ Edit Profile
            </button>

            <div style={{ position: 'relative', marginTop: 16, display: 'grid', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, padding: '12px 14px', borderRadius: 16, background: 'var(--surface-04)', border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Account Type</span>
                <span style={{ color: 'var(--text-heading)', fontWeight: 900 }}>
                  {isGithubUser ? 'GitHub OAuth' : 'Email Login'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, padding: '12px 14px', borderRadius: 16, background: 'var(--surface-04)', border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Avatar</span>
                <span style={{ color: isGithubUser ? 'var(--success)' : 'var(--brand-primary)', fontWeight: 900 }}>
                  {isGithubUser ? 'GitHub synced' : getSelectedAvatar(profile?.selectedAvatar).name}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, padding: '12px 14px', borderRadius: 16, background: 'var(--surface-04)', border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>GitHub</span>
                <span style={{ color: profile?.githubConnected ? 'var(--success)' : 'var(--text-muted)', fontWeight: 900 }}>
                  {profile?.githubConnected ? `@${profile?.githubUsername}` : 'Not connected'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, padding: '12px 14px', borderRadius: 16, background: 'var(--surface-04)', border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Member Since</span>
                <span style={{ color: 'var(--text-heading)', fontWeight: 900 }}>{formatDate(profile?.createdAt)}</span>
              </div>
            </div>
          </div>

          <div style={{ ...cardStyle, padding: 28, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: '-80px auto auto -80px', width: 220, height: 220, borderRadius: '50%', background: 'var(--purple-tint-10)', filter: 'blur(38px)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ ...labelStyle, marginBottom: 8 }}>Dashboard Overview</div>
                  <h2 style={{ margin: 0, color: 'var(--text-heading)', fontSize: 30, letterSpacing: -1.2 }}>
                    Your review activity
                  </h2>
                  <p style={{ margin: '10px 0 0', color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: 650 }}>
                    Track your AI code review progress, average quality score, issue severity, and recent analysis history from one place.
                  </p>
                </div>

                <Link
                  to="/review"
                  style={{
                    textDecoration: 'none',
                    padding: '12px 20px',
                    borderRadius: 999,
                    background: 'linear-gradient(135deg,var(--brand-blue),var(--brand-purple))',
                    color: 'white',
                    fontWeight: 950,
                    boxShadow: '0 18px 42px var(--brand-glow)',
                  }}
                >
                  ⚡ New Review
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(130px, 1fr))', gap: 14, marginTop: 28 }}>
                <div style={statCardStyle}>
                  <div style={labelStyle}>Total Reviews</div>
                  <div style={{ marginTop: 13, fontSize: 36, fontWeight: 950, color: 'var(--text-heading)', lineHeight: 1 }}>{stats.totalReviews}</div>
                  <p style={{ margin: '10px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>Saved in your history</p>
                </div>

                <div style={{ ...statCardStyle, borderColor: averageScoreStyle.border }}>
                  <div style={labelStyle}>Average Score</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, marginTop: 13 }}>
                    <span style={{ fontSize: 36, fontWeight: 950, color: averageScoreStyle.color, lineHeight: 1 }}>{stats.averageScore}</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 800 }}>/100</span>
                  </div>
                  <span style={{ display: 'inline-flex', marginTop: 10, padding: '4px 10px', borderRadius: 999, background: averageScoreStyle.bg, color: averageScoreStyle.color, border: `1px solid ${averageScoreStyle.border}`, fontSize: 12, fontWeight: 950 }}>
                    {averageScoreStyle.label}
                  </span>
                </div>

                <div style={statCardStyle}>
                  <div style={labelStyle}>Best Score</div>
                  <div style={{ marginTop: 13, fontSize: 36, fontWeight: 950, color: 'var(--brand-primary)', lineHeight: 1 }}>{stats.bestScore}</div>
                  <p style={{ margin: '10px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>Highest review score</p>
                </div>

                <div style={statCardStyle}>
                  <div style={labelStyle}>Top Language</div>
                  <div style={{ marginTop: 13, fontSize: 24, fontWeight: 950, color: 'var(--text-heading)', lineHeight: 1.15, textTransform: 'capitalize', wordBreak: 'break-word' }}>
                    {stats.topLanguage}
                  </div>
                  <p style={{ margin: '10px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>Most reviewed language</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, marginTop: 22 }}>
          <div style={{ ...cardStyle, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginBottom: 18 }}>
              <div>
                <div style={labelStyle}>Score Quality</div>
                <h3 style={{ margin: '7px 0 0', color: 'var(--text-heading)', fontSize: 24 }}>Good / Fair / Poor</h3>
              </div>
              <span style={{ padding: '6px 11px', borderRadius: 999, background: 'var(--brand-tint-10)', border: '1px solid var(--brand-tint-30)', color: 'var(--brand-primary)', fontWeight: 950, fontSize: 12 }}>
                {stats.totalReviews} total
              </span>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {[
                { label: 'Good', value: stats.scoreBreakdown.good, color: 'var(--success)', bg: 'var(--success-tint-10)', border: 'var(--success-tint-30)' },
                { label: 'Fair', value: stats.scoreBreakdown.fair, color: 'var(--warning)', bg: 'var(--warning-tint-10)', border: 'var(--warning-tint-25)' },
                { label: 'Poor', value: stats.scoreBreakdown.poor, color: 'var(--danger)', bg: 'var(--danger-tint-10)', border: 'var(--danger-tint-30)' },
              ].map((item) => {
                const percent = stats.totalReviews ? Math.round((item.value / stats.totalReviews) * 100) : 0;
                return (
                  <div key={item.label} style={{ padding: 14, borderRadius: 18, background: item.bg, border: `1px solid ${item.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
                      <span style={{ color: item.color, fontWeight: 950 }}>{item.label}</span>
                      <span style={{ color: 'var(--text-heading)', fontWeight: 950 }}>{item.value} review{item.value === 1 ? '' : 's'}</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 999, background: 'var(--surface-05)', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', borderRadius: 999, background: item.color, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ ...cardStyle, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginBottom: 18 }}>
              <div>
                <div style={labelStyle}>Issue Severity</div>
                <h3 style={{ margin: '7px 0 0', color: 'var(--text-heading)', fontSize: 24 }}>Detected issues</h3>
              </div>
              <span style={{ padding: '6px 11px', borderRadius: 999, background: 'var(--purple-tint-10)', border: '1px solid var(--purple-tint-30)', color: 'var(--brand-purple-soft)', fontWeight: 950, fontSize: 12 }}>
                AI findings
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { label: 'High', value: stats.severityCounts.high, icon: '🚨', color: 'var(--danger)', bg: 'var(--danger-tint-10)', border: 'var(--danger-tint-30)' },
                { label: 'Medium', value: stats.severityCounts.medium, icon: '⚠️', color: 'var(--warning)', bg: 'var(--warning-tint-10)', border: 'var(--warning-tint-25)' },
                { label: 'Low', value: stats.severityCounts.low, icon: '💡', color: 'var(--success)', bg: 'var(--success-tint-10)', border: 'var(--success-tint-30)' },
              ].map((item) => (
                <div key={item.label} style={{ padding: 16, borderRadius: 20, background: item.bg, border: `1px solid ${item.border}`, textAlign: 'center' }}>
                  <div style={{ fontSize: 23 }}>{item.icon}</div>
                  <div style={{ marginTop: 9, fontSize: 30, fontWeight: 950, color: item.color, lineHeight: 1 }}>{item.value}</div>
                  <div style={{ marginTop: 7, color: 'var(--text-muted)', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.7 }}>{item.label}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 18, padding: 14, borderRadius: 18, background: 'var(--surface-04)', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-heading)', fontWeight: 900, marginBottom: 6 }}>Latest review</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                {stats.latestReview ? `${stats.latestReview.title || 'Untitled Review'} • ${formatDate(stats.latestReview.createdAt)}` : 'No reviews yet. Start your first code review.'}
              </div>
            </div>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 22, marginTop: 22 }}>
          <div style={{ ...cardStyle, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginBottom: 18 }}>
              <div>
                <div style={labelStyle}>Recent Activity</div>
                <h3 style={{ margin: '7px 0 0', color: 'var(--text-heading)', fontSize: 24 }}>Latest reviews</h3>
              </div>
              <Link to="/history" style={{ textDecoration: 'none', color: 'var(--brand-primary)', fontWeight: 950, fontSize: 14 }}>
                View all →
              </Link>
            </div>

            {reviews.length === 0 ? (
              <div style={{ padding: 24, borderRadius: 20, background: 'var(--surface-04)', border: '1px dashed var(--border-strong)', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🧪</div>
                <div style={{ color: 'var(--text-heading)', fontWeight: 950, fontSize: 18 }}>No reviews yet</div>
                <p style={{ color: 'var(--text-muted)', margin: '8px 0 18px' }}>Analyze your first code sample to start filling this dashboard.</p>
                <Link to="/review" style={{ textDecoration: 'none', color: 'white', background: 'linear-gradient(135deg,var(--brand-blue),var(--brand-purple))', padding: '10px 16px', borderRadius: 999, fontWeight: 950 }}>
                  Start Review
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {reviews.slice(0, 5).map((review) => {
                  const score = Number(review.overallScore || 0);
                  const scoreStyle = getScoreLabel(score);

                  return (
                    <div key={review._id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'center', padding: 15, borderRadius: 18, background: 'var(--surface-04)', border: '1px solid var(--border)' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ color: 'var(--text-heading)', fontWeight: 950, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {review.title || 'Untitled Review'}
                        </div>
                        <div style={{ marginTop: 6, color: 'var(--text-muted)', fontSize: 13 }}>
                          {(review.language || 'unknown').toUpperCase()} • {formatDate(review.createdAt)} • {(review.sourceType || 'paste').toUpperCase()}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ padding: '5px 10px', borderRadius: 999, background: scoreStyle.bg, color: scoreStyle.color, border: `1px solid ${scoreStyle.border}`, fontWeight: 950, fontSize: 12 }}>
                          {scoreStyle.label} {score}
                        </span>
                        <Link to="/history" style={{ textDecoration: 'none', color: 'var(--brand-primary)', fontWeight: 950, fontSize: 13 }}>
                          Open
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ ...cardStyle, padding: 24 }}>
            <div style={labelStyle}>Usage Breakdown</div>
            <h3 style={{ margin: '7px 0 18px', color: 'var(--text-heading)', fontSize: 24 }}>Languages & sources</h3>

            <div style={{ display: 'grid', gap: 18 }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 900, marginBottom: 10 }}>Languages reviewed</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {Object.keys(stats.languageCounts).length === 0 ? (
                    <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>No language data yet.</span>
                  ) : (
                    Object.entries(stats.languageCounts).map(([language, count]) => (
                      <span key={language} style={{ padding: '7px 11px', borderRadius: 999, background: 'var(--brand-tint-10)', color: 'var(--brand-primary)', border: '1px solid var(--brand-tint-30)', fontWeight: 950, fontSize: 12, textTransform: 'uppercase' }}>
                        {language} · {count}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 900, marginBottom: 10 }}>Review sources</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {['paste', 'upload', 'github'].map((source) => (
                    <div key={source} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 13px', borderRadius: 15, background: 'var(--surface-04)', border: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 800, textTransform: 'capitalize' }}>{source}</span>
                      <span style={{ color: 'var(--text-heading)', fontWeight: 950 }}>{stats.sourceCounts[source] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {editOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Edit profile"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            background: 'rgba(0,0,0,0.62)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 18,
          }}
        >
          <form
            onSubmit={handleSaveProfile}
            style={{
              ...cardStyle,
              width: 'min(640px, 100%)',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 26,
              borderColor: 'var(--brand-tint-30)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18, marginBottom: 20 }}>
              <div>
                <div style={labelStyle}>Edit Profile</div>
                <h2 style={{ margin: '6px 0 0', color: 'var(--text-heading)', fontSize: 28 }}>Update your profile</h2>
                <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Update your display name, bio, and avatar preference.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                disabled={saving}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  background: 'var(--surface-04)',
                  color: 'var(--text-primary)',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: 18,
                  fontWeight: 900,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <label style={{ display: 'grid', gap: 8 }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 900 }}>Display name</span>
                <input
                  value={editForm.displayName}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, displayName: e.target.value }))}
                  maxLength={60}
                  required
                  style={inputStyle}
                  placeholder="Enter display name"
                />
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{editForm.displayName.length}/60 characters</span>
              </label>

              <label style={{ display: 'grid', gap: 8 }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 900 }}>Bio / About</span>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                  maxLength={180}
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                  placeholder="Example: Full-stack developer interested in AI code review and secure coding."
                />
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{editForm.bio.length}/180 characters</span>
              </label>

              <div style={{ display: 'grid', gap: 10 }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 900 }}>Avatar</span>

                {isGithubUser ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, borderRadius: 18, background: 'var(--surface-04)', border: '1px solid var(--success-tint-30)' }}>
                    <ProfileAvatar user={profile} size={54} radius="50%" fontSize={22} />
                    <div>
                      <div style={{ color: 'var(--text-heading)', fontWeight: 950 }}>GitHub avatar locked</div>
                      <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.45 }}>
                        GitHub users use their GitHub profile picture only. Change it on GitHub to update it here.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
                    {PRESET_AVATARS.map((avatar) => {
                      const selected = editForm.selectedAvatar === avatar.id;
                      return (
                        <button
                          key={avatar.id}
                          type="button"
                          onClick={() => setEditForm((prev) => ({ ...prev, selectedAvatar: avatar.id }))}
                          style={{
                            padding: 12,
                            borderRadius: 18,
                            border: selected ? '2px solid var(--brand-primary)' : '1px solid var(--border)',
                            background: selected ? 'var(--brand-tint-10)' : 'var(--surface-04)',
                            boxShadow: selected ? '0 0 26px var(--brand-tint-20)' : 'none',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                          }}
                        >
                          <span style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 8px',
                            background: avatar.bg,
                            fontSize: 23,
                            boxShadow: '0 10px 24px var(--surface-10)',
                          }}>
                            {avatar.icon}
                          </span>
                          <span style={{ fontWeight: 900, fontSize: 13 }}>{avatar.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {saveError && (
                <div style={{ padding: 12, borderRadius: 14, background: 'var(--danger-tint-10)', border: '1px solid var(--danger-tint-30)', color: 'var(--danger)', fontWeight: 800 }}>
                  {saveError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  disabled={saving}
                  style={{
                    padding: '11px 17px',
                    borderRadius: 999,
                    border: '1px solid var(--border)',
                    background: 'var(--surface-04)',
                    color: 'var(--text-primary)',
                    fontWeight: 900,
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '11px 20px',
                    borderRadius: 999,
                    border: '1px solid var(--brand-tint-30)',
                    background: 'linear-gradient(135deg,var(--brand-blue),var(--brand-purple))',
                    color: 'white',
                    fontWeight: 950,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.75 : 1,
                    boxShadow: '0 14px 34px var(--brand-glow)',
                  }}
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
