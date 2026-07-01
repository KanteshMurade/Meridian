import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReviews, deleteReview, shareReview } from '../services/api';

function SeverityBadge({ severity }) {
  const s = {
    high:   { background: 'var(--danger-tint-10)', color: 'var(--danger-text)', border: '1px solid var(--danger-tint-25)' },
    medium: { background: 'var(--warning-tint-10)',  color: 'var(--warning-text)', border: '1px solid var(--warning-tint-25)' },
    low:    { background: 'var(--success-tint-10)', color: 'var(--success-text)', border: '1px solid var(--success-tint-25)' },
  };
  return <span style={{ ...s[severity] || s.low, padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{severity}</span>;
}


function getQuality(score) {
  if (score >= 80) return { label: 'Good', icon: '✅', color: 'var(--success)', bg: 'var(--success-tint-10)', border: 'var(--success-tint-25)' };
  if (score >= 50) return { label: 'Fair', icon: '⚠️', color: 'var(--warning)', bg: 'var(--warning-tint-10)', border: 'var(--warning-tint-25)' };
  return { label: 'Poor', icon: '🔴', color: 'var(--danger)', bg: 'var(--danger-tint-10)', border: 'var(--danger-tint-25)' };
}

function ReviewDetail({ review }) {
  const [expanded, setExpanded] = useState(null);
  if (!review) return (
    <div style={{ background: 'var(--bg-panel)', border: '1px dashed var(--border)', borderRadius: 14, padding: 48, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow)' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>👈</div>
      <p style={{ fontSize: 14, color: 'var(--text-faint)' }}>Select a review to see details</p>
    </div>
  );

  const scoreColor = review.overallScore >= 70 ? 'var(--success)' : review.overallScore >= 40 ? 'var(--yellow)' : 'var(--danger)';
  const progressGrad = review.overallScore >= 70 ? 'linear-gradient(90deg,var(--success-strong),var(--success))' : review.overallScore >= 40 ? 'linear-gradient(90deg,var(--warning-strong),var(--yellow))' : 'linear-gradient(90deg,var(--danger-strong),var(--danger))';
  const quality = getQuality(review.overallScore);
  const high = review.suggestions?.filter(s => s.severity === 'high').length || 0;
  const med  = review.suggestions?.filter(s => s.severity === 'medium').length || 0;
  const low  = review.suggestions?.filter(s => s.severity === 'low').length || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'fadeUp 0.3s ease' }}>
      {/* Score */}
      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 3 }}>{review.title || 'Untitled Review'}</h3>
            <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>
              {review.language !== 'unknown' && <span style={{ color: 'var(--brand-primary)', fontFamily: "'JetBrains Mono',monospace" }}>{review.language} · </span>}
              {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 42, fontWeight: 900, color: scoreColor, lineHeight: 1, letterSpacing: -1 }}>{review.overallScore}</div>
            <div style={{ fontSize: 12, color: 'var(--text-faint)', fontWeight: 700, marginBottom: 6 }}>/ 100</div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 9px', borderRadius: 999, background: quality.bg, border: `1px solid ${quality.border}`, color: quality.color, fontSize: 10, fontWeight: 900, letterSpacing: 0.8, textTransform: 'uppercase' }}>
              <span>{quality.icon}</span>{quality.label}
            </span>
          </div>
        </div>
        <div style={{ height: 4, background: 'var(--border-soft)', borderRadius: 2, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{ height: '100%', borderRadius: 2, background: progressGrad, width: `${review.overallScore}%` }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { n: high, l: 'High', c: 'var(--danger)', bg: 'var(--danger-tint-06)', b: 'var(--danger-tint-15)' },
            { n: med,  l: 'Med',  c: 'var(--warning)', bg: 'var(--warning-tint-06)',  b: 'var(--warning-tint-15)' },
            { n: low,  l: 'Low',  c: 'var(--success)', bg: 'var(--success-tint-06)', b: 'var(--success-tint-15)' },
          ].map(({ n, l, c, bg, b }) => (
            <div key={l} style={{ background: bg, border: `1px solid ${b}`, borderRadius: 10, padding: '12px 8px', textAlign: 'center', boxShadow: 'inset 0 1px 0 var(--surface-10)' }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: c, lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 5, fontWeight: 850, letterSpacing: 0.8, textTransform: 'uppercase' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, boxShadow: 'var(--shadow)' }}>
        <div style={{ fontSize: 10, color: 'var(--text-faint)', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>Summary</div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{review.summary}</p>
      </div>

      {/* Suggestions */}
      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, boxShadow: 'var(--shadow)' }}>
        <div style={{ fontSize: 10, color: 'var(--text-faint)', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>
          Suggestions ({review.suggestions?.length || 0})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {review.suggestions?.map((s, i) => {
            const bc = s.severity === 'high' ? 'var(--danger)' : s.severity === 'medium' ? 'var(--warning)' : 'var(--success)';
            return (
              <div key={i} onClick={() => setExpanded(expanded === i ? null : i)}
                style={{ borderLeft: `2px solid ${bc}`, background: 'var(--bg-card)', borderRadius: '0 8px 8px 0', cursor: 'pointer', overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <SeverityBadge severity={s.severity} />
                      {s.line > 0 && <span style={{ fontSize: 10, color: 'var(--text-faint)', fontFamily: "'JetBrains Mono',monospace" }}>L{s.line}</span>}
                    </div>
                    <span style={{ color: 'var(--text-faint)', fontSize: 11 }}>{expanded === i ? '▲' : '▼'}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.issue}</p>
                </div>
                {expanded === i && s.refactoredCode && (
                  <div style={{ borderTop: '1px solid var(--surface-04)', padding: '10px 14px' }}>
                    <p style={{ fontSize: 12, color: 'var(--success-text)', marginBottom: 8 }}>✅ {s.suggestion}</p>
                    <pre style={{ background: 'var(--bg-code)', padding: 10, borderRadius: 6, fontSize: 11, color: 'var(--brand-cyan)', fontFamily: "'JetBrains Mono',monospace", overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0 }}>
                      {s.refactoredCode}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function History() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [reviews, setReviews] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  if (!token) { navigate('/login'); return null; }

  useEffect(() => {
    getReviews().then(({ data }) => setReviews(data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this review?')) return;
    await deleteReview(id);
    setReviews(r => r.filter(x => x._id !== id));
    if (selected?._id === id) setSelected(null);
  };

  const handleShare = async (e, id) => {
    e.stopPropagation();
    try {
      const { data } = await shareReview(id);
      navigator.clipboard.writeText(`${window.location.origin}/share/${data.shareableLink}`);
      alert('Link copied!');
    } catch { alert('Failed to share'); }
  };

  const filtered = reviews.filter(r => {
    const matchSearch = !search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.language?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'good' && r.overallScore >= 70) || (filter === 'fair' && r.overallScore >= 40 && r.overallScore < 70) || (filter === 'poor' && r.overallScore < 40);
    return matchSearch && matchFilter;
  });

  const scoreColor = (s) => s >= 70 ? 'var(--success)' : s >= 40 ? 'var(--yellow)' : 'var(--danger)';
  const scoreBg    = (s) => s >= 70 ? 'var(--success-tint-08)' : s >= 40 ? 'var(--yellow-tint-08)' : 'var(--danger-tint-08)';
  const scoreBorder= (s) => s >= 70 ? 'var(--success-tint-20)' : s >= 40 ? 'var(--yellow-tint-20)' : 'var(--danger-tint-20)';

  const S = {
    page: { minHeight: '100vh', background: 'var(--bg-page)', fontFamily: "'Outfit', sans-serif" },
    container: { maxWidth: 1280, margin: '0 auto', padding: '32px 24px' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 },
    title: { fontSize: 26, fontWeight: 800, color: 'var(--text-heading)', letterSpacing: -0.5 },
    newBtn: {
      padding: '8px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
      background: 'linear-gradient(135deg,var(--brand-hover),var(--brand-purple-strong))', color: 'white',
      border: 'none', cursor: 'pointer',
      boxShadow: '0 4px 14px var(--brand-tint-30)',
    },
    toolbar: { display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' },
    searchWrap: { position: 'relative', flex: 1, minWidth: 200 },
    searchInput: {
      width: '100%', padding: '9px 14px 9px 36px', borderRadius: 10, fontSize: 13,
      background: 'var(--bg-panel)', border: '1px solid var(--border)',
      color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
    },
    searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--text-faint)' },
    filterBtns: { display: 'flex', gap: 6 },
    grid: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 20, alignItems: 'start' },
    listWrap: { display: 'flex', flexDirection: 'column', gap: 10 },
    reviewCard: {
      background: 'linear-gradient(145deg, var(--bg-panel), var(--surface-03))', border: '1px solid var(--border)',
      borderRadius: 14, padding: 17, cursor: 'pointer',
      boxShadow: '0 14px 38px var(--surface-05)',
      transition: 'all 0.2s',
    },
    reviewCardActive: {
      background: 'linear-gradient(145deg, var(--brand-tint-08), var(--purple-tint-04))', border: '1px solid var(--brand-tint-30)',
      borderRadius: 14, padding: 17, cursor: 'pointer',
      boxShadow: 'var(--shadow)',
    },
    emptyWrap: { background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 14, padding: 60, textAlign: 'center', boxShadow: 'var(--shadow)' },
  };

  return (
    <div style={S.page}>
      <div style={S.container}>
        <div style={S.header} className="fade-up">
          <div>
            <h1 style={S.title}>Review History</h1>
            <p style={{ fontSize: 13, color: 'var(--text-faint)', marginTop: 4 }}>{reviews.length} total review{reviews.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => navigate('/review')} style={S.newBtn}>⚡ New Review</button>
        </div>

        {/* Toolbar */}
        <div style={S.toolbar} className="fade-up-1">
          <div style={S.searchWrap}>
            <span style={S.searchIcon}>🔍</span>
            <input type="text" placeholder="Search reviews..." value={search}
              onChange={e => setSearch(e.target.value)} style={S.searchInput}
              onFocus={e => e.target.style.borderColor = 'var(--brand-tint-40)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div style={S.filterBtns}>
            {[
              {
                key: 'all',
                label: 'All',
                activeBg: 'var(--brand-tint-10)',
                border: 'var(--brand-tint-30)',
                hoverBorder: 'var(--brand-primary)',
                activeColor: 'var(--brand-primary)',
                glow: 'var(--brand-tint-15)',
              },
              {
                key: 'good',
                label: '✅ Good',
                activeBg: 'var(--success-tint-10)',
                border: 'var(--success-tint-25)',
                hoverBorder: 'var(--success)',
                activeColor: 'var(--success)',
                glow: 'var(--success-tint-10)',
              },
              {
                key: 'fair',
                label: '⚠️ Fair',
                activeBg: 'var(--warning-tint-10)',
                border: 'var(--warning-tint-25)',
                hoverBorder: 'var(--warning)',
                activeColor: 'var(--warning)',
                glow: 'var(--warning-tint-10)',
              },
              {
                key: 'poor',
                label: '🔴 Poor',
                activeBg: 'var(--danger-tint-10)',
                border: 'var(--danger-tint-25)',
                hoverBorder: 'var(--danger)',
                activeColor: 'var(--danger)',
                glow: 'var(--danger-tint-10)',
              },
            ].map(({ key, label, activeBg, border, hoverBorder, activeColor, glow }) => {
              const isActive = filter === key;

              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  style={{
                    padding: '8px 15px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 850,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: isActive ? activeBg : 'var(--surface-03)',
                    border: `1px solid ${border}`,
                    color: isActive ? activeColor : 'var(--text-secondary)',
                    boxShadow: isActive ? `0 8px 22px ${glow}` : 'none',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = hoverBorder;
                    e.currentTarget.style.boxShadow = `0 8px 22px ${glow}`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = border;
                    e.currentTarget.style.boxShadow = isActive ? `0 8px 22px ${glow}` : 'none';
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--brand-tint-20)', borderTopColor: 'var(--brand-hover)', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-faint)', fontSize: 14 }}>Loading reviews...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={S.emptyWrap}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-faint)', marginBottom: 8 }}>{search ? 'No matching reviews' : 'No reviews yet'}</h3>
            <p style={{ fontSize: 14, color: 'var(--text-faint)', marginBottom: 24 }}>{search ? 'Try a different search term' : 'Start by reviewing some code!'}</p>
            {!search && <button onClick={() => navigate('/review')} style={{ padding: '9px 22px', borderRadius: 9, background: 'linear-gradient(135deg,var(--brand-hover),var(--brand-purple-strong))', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>Review Code →</button>}
          </div>
        ) : (
          <div style={{ ...S.grid, gridTemplateColumns: window.innerWidth < 900 ? '1fr' : 'minmax(0, 1fr) minmax(0, 1fr)' }} className="fade-up-2">
            {/* List */}
            <div style={S.listWrap}>
              {filtered.map(r => (
                <div key={r._id}
                  onClick={() => setSelected(r)}
                  style={selected?._id === r._id ? S.reviewCardActive : S.reviewCard}
                  onMouseEnter={e => { if (selected?._id !== r._id) e.currentTarget.style.borderColor = 'var(--brand-tint-20)'; }}
                  onMouseLeave={e => { if (selected?._id !== r._id) e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 5 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                          {r.title || 'Untitled Review'}
                        </span>
                        {r.language && r.language !== 'unknown' && (
                          <span style={{ padding: '1px 7px', borderRadius: 4, fontSize: 10, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", background: 'var(--brand-tint-08)', color: 'var(--brand-primary)', border: '1px solid var(--brand-tint-15)' }}>
                            {r.language}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                        {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' · '}{r.suggestions?.length || 0} issues
                      </p>
                    </div>
                    <div style={{ padding: '6px 10px', borderRadius: 10, background: scoreBg(r.overallScore), border: `1px solid ${scoreBorder(r.overallScore)}`, color: scoreColor(r.overallScore), flexShrink: 0, textAlign: 'center', minWidth: 72 }}>
                      <div style={{ fontSize: 16, fontWeight: 900, lineHeight: 1 }}>{r.overallScore}</div>
                      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 3 }}>{getQuality(r.overallScore).label}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--surface-05)' }}>
                    <button onClick={e => handleShare(e, r._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--text-faint)', padding: '2px 6px', borderRadius: 5 }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-primary)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
                    >🔗 Share</button>
                    <button onClick={e => handleDelete(e, r._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--text-faint)', padding: '2px 6px', borderRadius: 5 }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
                    >🗑 Delete</button>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-faint)' }}>Click to view →</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Detail */}
            <div style={{ position: 'sticky', top: 80 }}>
              <ReviewDetail review={selected} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}