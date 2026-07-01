import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DiffView from '../components/DiffView';
import { analyzeCode, getRepos, getRepoContents, getFileContent } from '../services/api';
import { detectLanguage } from '../utils/languageDetect';

const MAX_CODE_LINES = 500;

const LANG_COLORS = {
  javascript: 'var(--yellow)',
  typescript: 'var(--brand-primary)',
  python: 'var(--success)',
  java: 'var(--warning)',
  cpp: 'var(--danger)',
  c: 'var(--brand-purple-soft)',
  go: 'var(--brand-cyan)',
  rust: 'var(--warning)',
  php: 'var(--brand-purple-soft)',
  unknown: 'var(--text-muted)',
};

function SeverityBadge({ severity }) {
  const styles = {
    high: {
      background: 'var(--danger-tint-10)',
      color: 'var(--danger-text)',
      border: '1px solid var(--danger-tint-25)',
    },
    medium: {
      background: 'var(--warning-tint-10)',
      color: 'var(--warning-text)',
      border: '1px solid var(--warning-tint-25)',
    },
    low: {
      background: 'var(--success-tint-10)',
      color: 'var(--success-text)',
      border: '1px solid var(--success-tint-25)',
    },
  };

  return (
    <span
      style={{
        ...(styles[severity] || styles.low),
        padding: '2px 10px',
        borderRadius: 100,
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 1,
      }}
    >
      {severity}
    </span>
  );
}

function getQuality(score) {
  if (score >= 80) {
    return {
      label: 'Good',
      icon: '✅',
      color: 'var(--success)',
      bg: 'var(--success-tint-10)',
      border: 'var(--success-tint-25)',
    };
  }

  if (score >= 50) {
    return {
      label: 'Fair',
      icon: '⚠️',
      color: 'var(--warning)',
      bg: 'var(--warning-tint-10)',
      border: 'var(--warning-tint-25)',
    };
  }

  return {
    label: 'Poor',
    icon: '🔴',
    color: 'var(--danger)',
    bg: 'var(--danger-tint-10)',
    border: 'var(--danger-tint-25)',
  };
}

function ScoreRing({ score }) {
  const quality = getQuality(score);

  return (
    <div style={{ textAlign: 'right' }}>
      <div
        style={{
          fontSize: 50,
          fontWeight: 900,
          color: quality.color,
          letterSpacing: -2,
          lineHeight: 1,
          textShadow: '0 0 24px var(--brand-tint-20)',
        }}
      >
        {score}
      </div>

      <div
        style={{
          fontSize: 13,
          color: 'var(--text-faint)',
          marginTop: 2,
          marginBottom: 8,
          fontWeight: 700,
        }}
      >
        / 100
      </div>

      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 10px',
          borderRadius: 999,
          background: quality.bg,
          border: `1px solid ${quality.border}`,
          color: quality.color,
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
        }}
      >
        <span>{quality.icon}</span>
        {quality.label}
      </span>
    </div>
  );
}

function ReviewPanel({ review }) {
  const [expanded, setExpanded] = useState(null);

  if (!review) return null;

  const high = review.suggestions?.filter((s) => s.severity === 'high').length || 0;
  const med = review.suggestions?.filter((s) => s.severity === 'medium').length || 0;
  const low = review.suggestions?.filter((s) => s.severity === 'low').length || 0;

  const progressColor =
    review.overallScore >= 70
      ? 'linear-gradient(90deg,var(--success-strong),var(--success))'
      : review.overallScore >= 40
        ? 'linear-gradient(90deg,var(--warning-strong),var(--yellow))'
        : 'linear-gradient(90deg,var(--danger-strong),var(--danger))';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        animation: 'fadeUp 0.4s ease',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(145deg, var(--bg-panel), var(--surface-03))',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 24,
          boxShadow: 'var(--shadow)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 16,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--text-heading)',
                marginBottom: 4,
              }}
            >
              Review Results
            </h2>

            <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>
              {review.language && review.language !== 'unknown' && (
                <span
                  style={{
                    color: 'var(--brand-primary)',
                    fontFamily: "'JetBrains Mono',monospace",
                  }}
                >
                  {review.language} ·{' '}
                </span>
              )}
              {review.suggestions?.length || 0} issues found
            </p>
          </div>

          <ScoreRing score={review.overallScore} />
        </div>

        <div
          style={{
            height: 5,
            background: 'var(--border-soft)',
            borderRadius: 3,
            overflow: 'hidden',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              height: '100%',
              borderRadius: 3,
              background: progressColor,
              width: `${review.overallScore}%`,
              transition: 'width 1s ease',
            }}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 10,
          }}
        >
          {[
            {
              count: high,
              label: 'High',
              color: 'var(--danger)',
              bg: 'var(--danger-tint-06)',
              border: 'var(--danger-tint-15)',
            },
            {
              count: med,
              label: 'Medium',
              color: 'var(--warning)',
              bg: 'var(--warning-tint-06)',
              border: 'var(--warning-tint-15)',
            },
            {
              count: low,
              label: 'Low',
              color: 'var(--success)',
              bg: 'var(--success-tint-06)',
              border: 'var(--success-tint-15)',
            },
          ].map(({ count, label, color, bg, border }) => (
            <div
              key={label}
              style={{
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: 10,
                padding: '14px 10px',
                textAlign: 'center',
                boxShadow: 'inset 0 1px 0 var(--surface-10)',
              }}
            >
              <div style={{ fontSize: 30, fontWeight: 900, color, lineHeight: 1 }}>{count}</div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-secondary)',
                  marginTop: 6,
                  fontWeight: 800,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: 20,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-faint)',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            marginBottom: 10,
            fontWeight: 600,
          }}
        >
          AI Summary
        </div>

        <p
          style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
          }}
        >
          {review.summary}
        </p>
      </div>

      <div
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: 20,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-faint)',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            marginBottom: 14,
            fontWeight: 600,
          }}
        >
          Suggestions ({review.suggestions?.length || 0})
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {review.suggestions?.map((s, i) => {
            const borderColor =
              s.severity === 'high'
                ? 'var(--danger)'
                : s.severity === 'medium'
                  ? 'var(--warning)'
                  : 'var(--success)';

            return (
              <div
                key={i}
                onClick={() => setExpanded(expanded === i ? null : i)}
                style={{
                  borderLeft: `2px solid ${borderColor}`,
                  background: 'var(--bg-card)',
                  borderRadius: '0 10px 10px 0',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{ padding: '12px 16px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <SeverityBadge severity={s.severity} />

                      {s.line > 0 && (
                        <span
                          style={{
                            fontSize: 11,
                            color: 'var(--text-faint)',
                            fontFamily: "'JetBrains Mono',monospace",
                          }}
                        >
                          Line {s.line}
                        </span>
                      )}
                    </div>

                    <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>
                      {expanded === i ? '▲' : '▼'}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                    }}
                  >
                    {s.issue}
                  </p>
                </div>

                {expanded === i && (
                  <div
                    style={{
                      borderTop: '1px solid var(--surface-05)',
                      padding: '12px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--success)', flexShrink: 0 }}>✅</span>
                      <p
                        style={{
                          fontSize: 13,
                          color: 'var(--success-text)',
                          lineHeight: 1.5,
                        }}
                      >
                        {s.suggestion}
                      </p>
                    </div>

                    {s.refactoredCode && (
                      <div
                        style={{
                          borderRadius: 8,
                          overflow: 'hidden',
                          border: '1px solid var(--border-soft)',
                        }}
                      >
                        <div
                          style={{
                            background: 'var(--bg-elevated)',
                            padding: '6px 12px',
                            fontSize: 11,
                            color: 'var(--text-faint)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: 'var(--success)',
                              display: 'inline-block',
                            }}
                          />
                          Suggested Fix
                        </div>

                        <pre
                          style={{
                            background: 'var(--bg-code)',
                            padding: 12,
                            fontSize: 12,
                            color: 'var(--brand-cyan)',
                            fontFamily: "'JetBrains Mono',monospace",
                            overflowX: 'hidden',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere',
                            margin: 0,
                          }}
                        >
                          {s.refactoredCode}
                        </pre>
                      </div>
                    )}
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

export default function Review() {
  const navigate = useNavigate();
  const fileRef = useRef();

  const token = localStorage.getItem('token');

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('');
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lineLimitError, setLineLimitError] = useState('');
  const [activeTab, setActiveTab] = useState('review');
  const [showRepo, setShowRepo] = useState(false);
  const [repos, setRepos] = useState([]);
  const [repoLoading, setRepoLoading] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [contents, setContents] = useState([]);

  if (!token) {
    navigate('/login');
    return null;
  }

  const currentLineCount = code ? code.split('\n').length : 0;

  const handleCodeChange = (val) => {
    const lines = val.split('\n');

    if (lines.length > MAX_CODE_LINES) {
      const limitedCode = lines.slice(0, MAX_CODE_LINES).join('\n');

      setCode(limitedCode);
      setLanguage(detectLanguage(limitedCode));
      setLineLimitError(`Only ${MAX_CODE_LINES} lines are allowed.`);

      return;
    }

    setCode(val);
    setLanguage(detectLanguage(val));
    setLineLimitError('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (ev) => {
      handleCodeChange(ev.target.result);
    };

    reader.readAsText(file);
    setTitle(file.name);
  };

  const loadRepos = async () => {
    setRepoLoading(true);

    try {
      const { data } = await getRepos();
      setRepos(data);
    } catch {
      setError('Failed to load repos. Make sure you logged in with GitHub.');
    } finally {
      setRepoLoading(false);
    }
  };

  const toggleRepo = () => {
    if (!showRepo && repos.length === 0) {
      loadRepos();
    }

    setShowRepo(!showRepo);
  };

  const browseRepo = async (repo, path = '') => {
    try {
      const { data } = await getRepoContents(repo.owner.login, repo.name, path);
      setContents(Array.isArray(data) ? data : [data]);
      setSelectedRepo({ repo, path });
    } catch {
      setError('Failed to load files.');
    }
  };

  const pickFile = async (item) => {
    if (item.type === 'dir') {
      browseRepo(selectedRepo.repo, item.path);
      return;
    }

    try {
      const { data } = await getFileContent(
        selectedRepo.repo.owner.login,
        selectedRepo.repo.name,
        item.path
      );

      handleCodeChange(data.content);
      setTitle(item.name);
      setShowRepo(false);
    } catch {
      setError('Failed to load file.');
    }
  };

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError('Please enter some code.');
      return;
    }

    const lines = code.split('\n');

    if (lines.length > MAX_CODE_LINES) {
      setError(`Please keep your code within ${MAX_CODE_LINES} lines before analyzing.`);
      return;
    }

    setLoading(true);
    setError('');
    setReview(null);

    try {
      const { data } = await analyzeCode({
        code,
        language: language || 'unknown',
        title: title || 'Untitled Review',
        sourceType: 'paste',
      });

      setReview(data);
      setActiveTab('review');
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const langColor = LANG_COLORS[language] || 'var(--text-muted)';

  const S = {
    page: {
      minHeight: '100vh',
      background: 'var(--bg-page)',
      fontFamily: "'Outfit', sans-serif",
    },

    container: {
      maxWidth: 1280,
      margin: '0 auto',
      padding: '32px 24px',
    },

    header: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 28,
      flexWrap: 'wrap',
      gap: 12,
    },

    title: {
      fontSize: 28,
      fontWeight: 800,
      color: 'var(--text-heading)',
      letterSpacing: -0.5,
    },

    subtitle: {
      fontSize: 14,
      color: 'var(--text-faint)',
      marginTop: 4,
    },

    historyBtn: {
      padding: '8px 18px',
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 600,
      background: 'var(--surface-04)',
      border: '1px solid var(--border-strong)',
      color: 'var(--text-secondary)',
      cursor: 'pointer',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
    },

    grid: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
      gap: 20,
    },

    inputStyle: {
      width: '100%',
      padding: '11px 14px',
      borderRadius: 10,
      fontSize: 14,
      background: 'var(--bg-panel)',
      border: '1px solid var(--border)',
      color: 'var(--text-primary)',
      outline: 'none',
      boxSizing: 'border-box',
      marginBottom: 12,
    },

    githubBtn: {
      padding: '9px 16px',
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 600,
      background: 'var(--surface-04)',
      border: '1px solid var(--border-strong)',
      color: 'var(--text-secondary)',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      transition: 'all 0.2s',
      marginBottom: 12,
    },

    codeWrap: {
      background: 'var(--bg-panel)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      overflow: 'hidden',
      marginBottom: 12,
      boxShadow: 'var(--shadow)',
    },

    codeHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 16px',
      borderBottom: '1px solid var(--border-soft)',
      background: 'var(--bg-elevated)',
    },

    codeLabel: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--text-primary)',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },

    langBadge: {
      padding: '2px 8px',
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 600,
      fontFamily: "'JetBrains Mono',monospace",
    },

    codeActions: {
      display: 'flex',
      gap: 6,
    },

    actionBtn: {
      padding: '5px 12px',
      borderRadius: 7,
      fontSize: 12,
      fontWeight: 600,
      background: 'var(--surface-05)',
      border: '1px solid var(--border-strong)',
      color: 'var(--text-secondary)',
      cursor: 'pointer',
      boxShadow: '0 6px 18px var(--surface-05)',
    },

    codeLimitNotice: {
      padding: '9px 16px',
      background: 'var(--brand-tint-08)',
      borderBottom: '1px solid var(--border-soft)',
      color: 'var(--brand-primary)',
      fontSize: 13,
      fontWeight: 700,
      lineHeight: 1.5,
    },

    textarea: {
      width: '100%',
      height: 340,
      padding: '16px',
      fontSize: 13,
      lineHeight: 1.8,
      background: 'var(--bg-code)',
      border: 'none',
      color: 'var(--brand-cyan)',
      fontFamily: "'JetBrains Mono',monospace",
      resize: 'none',
      outline: 'none',
      boxSizing: 'border-box',
    },

    codeFooter: {
      padding: '6px 16px',
      background: 'var(--bg-elevated)',
      fontSize: 11,
      color: 'var(--text-faint)',
      textAlign: 'right',
      borderTop: '1px solid var(--surface-04)',
    },

    lineLimitWarning: {
      marginTop: 8,
      padding: '9px 12px',
      borderRadius: 9,
      background: 'var(--warning-tint-10)',
      border: '1px solid var(--warning-tint-25)',
      color: 'var(--warning-text)',
      fontSize: 13,
      fontWeight: 600,
      lineHeight: 1.5,
    },

    errorBox: {
      padding: '10px 14px',
      borderRadius: 10,
      marginBottom: 12,
      background: 'var(--danger-tint-08)',
      border: '1px solid var(--danger-tint-20)',
      color: 'var(--danger-text)',
      fontSize: 13,
    },

    analyzeBtn: {
      width: '100%',
      padding: '14px',
      borderRadius: 12,
      fontSize: 16,
      fontWeight: 700,
      background: 'linear-gradient(135deg, var(--brand-hover), var(--brand-purple-strong))',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      boxShadow: '0 8px 28px var(--brand-tint-30)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },

    emptyPanel: {
      background: 'var(--bg-panel)',
      border: '1px dashed var(--border)',
      borderRadius: 14,
      padding: 60,
      textAlign: 'center',
      boxShadow: 'var(--shadow)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 400,
    },

    loadingPanel: {
      background: 'var(--bg-panel)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      padding: 60,
      textAlign: 'center',
      boxShadow: 'var(--shadow)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 400,
    },

    tabs: {
      display: 'flex',
      gap: 8,
      marginBottom: 14,
    },

    tabActive: {
      padding: '7px 18px',
      borderRadius: 9,
      fontSize: 13,
      fontWeight: 850,
      background: 'linear-gradient(135deg, var(--brand-tint-15), var(--purple-tint-10))',
      border: '1px solid var(--brand-tint-30)',
      color: 'var(--brand-primary)',
      cursor: 'pointer',
    },

    tabInactive: {
      padding: '7px 18px',
      borderRadius: 9,
      fontSize: 13,
      fontWeight: 800,
      background: 'var(--surface-02)',
      border: '1px solid var(--border)',
      color: 'var(--text-faint)',
      cursor: 'pointer',
    },

    repoPanel: {
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      boxShadow: 'var(--shadow)',
    },

    repoItem: {
      padding: '10px 14px',
      borderRadius: 9,
      cursor: 'pointer',
      border: '1px solid var(--surface-05)',
      background: 'var(--bg-panel)',
      marginBottom: 8,
      transition: 'all 0.2s',
    },
  };

  const analyzeDisabled = loading || !code.trim();

  return (
    <div style={S.page}>
      <div style={S.container}>
        <div style={S.header} className="fade-up">
          <div>
            <h1 style={S.title}>Code Review</h1>
            <p style={S.subtitle}>Paste code or load from GitHub for an instant AI review</p>
          </div>

          <button onClick={() => navigate('/history')} style={S.historyBtn}>
            📜 View History
          </button>
        </div>

        <div
          style={{
            ...S.grid,
            gridTemplateColumns:
              window.innerWidth < 900
                ? '1fr'
                : 'minmax(0, 1fr) minmax(0, 1fr)',
          }}
        >
          {/* LEFT */}
          <div className="fade-up-1" style={{ minWidth: 0 }}>
            <input
              type="text"
              placeholder="Review title (optional)..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={S.inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--brand-tint-40)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
              }}
            />

            <button
              style={S.githubBtn}
              onClick={toggleRepo}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--border)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--surface-04)';
              }}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              {showRepo ? 'Hide GitHub Picker' : 'Load from GitHub'}
            </button>

            {showRepo && (
              <div style={S.repoPanel}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: 10,
                  }}
                >
                  📁 Your Repositories
                </div>

                {repoLoading && (
                  <div style={{ color: 'var(--text-faint)', fontSize: 13 }}>
                    Loading repos...
                  </div>
                )}

                {!selectedRepo &&
                  repos.map((repo) => (
                    <div
                      key={repo.id}
                      style={S.repoItem}
                      onClick={() => browseRepo(repo)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--brand-tint-30)';
                        e.currentTarget.style.background = 'var(--bg-panel-strong)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--surface-05)';
                        e.currentTarget.style.background = 'var(--bg-panel)';
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {repo.name}
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          color: 'var(--text-faint)',
                          marginTop: 3,
                        }}
                      >
                        {repo.language} · ⭐ {repo.stargazers_count}
                      </div>
                    </div>
                  ))}

                {selectedRepo && (
                  <>
                    <button
                      onClick={() => setSelectedRepo(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--brand-primary)',
                        fontSize: 13,
                        cursor: 'pointer',
                        marginBottom: 10,
                      }}
                    >
                      ← Back to repos
                    </button>

                    <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                      {contents.map((item) => (
                        <div
                          key={item.sha}
                          style={S.repoItem}
                          onClick={() => pickFile(item)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-panel-strong)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--bg-panel)';
                          }}
                        >
                          <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                            {item.type === 'dir' ? '📁' : '📄'} {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <div style={S.codeWrap}>
              <div style={S.codeHeader}>
                <div style={S.codeLabel}>
                  Your Code
                  {language && language !== 'unknown' && (
                    <span
                      style={{
                        ...S.langBadge,
                        background: `${langColor}18`,
                        color: langColor,
                        border: `1px solid ${langColor}30`,
                      }}
                    >
                      {language}
                    </span>
                  )}
                </div>

                <div style={S.codeActions}>
                  <input
                    type="file"
                    ref={fileRef}
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.php,.go,.rs,.html,.css"
                  />

                  <button style={S.actionBtn} onClick={() => fileRef.current.click()}>
                    📁 Upload
                  </button>

                  <button
                    style={S.actionBtn}
                    onClick={() => {
                      setCode('');
                      setLanguage('');
                      setLineLimitError('');
                    }}
                  >
                    🗑 Clear
                  </button>
                </div>
              </div>

              <div style={S.codeLimitNotice}>
                ℹ Only code up to {MAX_CODE_LINES} lines is allowed for one analysis.
              </div>

              <textarea
                style={S.textarea}
                placeholder="Paste your code here or upload a file..."
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                spellCheck={false}
              />

              <div style={S.codeFooter}>
                {currentLineCount} / {MAX_CODE_LINES} lines · {code.length} chars
              </div>
            </div>

            {lineLimitError && <div style={S.lineLimitWarning}>⚠ {lineLimitError}</div>}

            {error && <div style={S.errorBox}>⚠️ {error}</div>}

            <button
              onClick={handleAnalyze}
              disabled={analyzeDisabled}
              style={{
                ...S.analyzeBtn,
                opacity: analyzeDisabled ? 0.5 : 1,
                cursor: analyzeDisabled ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!analyzeDisabled) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 36px var(--brand-tint-40)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 28px var(--brand-tint-30)';
              }}
            >
              {loading ? (
                <>
                  <span className="spinner" /> Analyzing your code...
                </>
              ) : (
                <>
                  <span>⚡</span> Analyze Code
                </>
              )}
            </button>

            {loading && (
              <div style={{ textAlign: 'center', marginTop: 10 }}>
                {[
                  'Scanning for bugs...',
                  'Checking best practices...',
                  'Generating suggestions...',
                ].map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 12,
                      color: 'var(--text-faint)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      marginTop: 6,
                    }}
                  >
                    <div
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: 'var(--brand-hover)',
                        animation: 'pulse 1.5s ease infinite',
                        animationDelay: `${i * 0.3}s`,
                      }}
                    />
                    {msg}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="fade-up-2" style={{ minWidth: 0 }}>
            {!review && !loading && (
              <div style={S.emptyPanel}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'var(--text-faint)',
                    marginBottom: 8,
                  }}
                >
                  Ready to analyze
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: 'var(--text-faint)',
                    maxWidth: 260,
                  }}
                >
                  Paste your code and click Analyze Code to get AI-powered insights
                </p>
              </div>
            )}

            {loading && (
              <div style={S.loadingPanel}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    border: '3px solid var(--brand-tint-20)',
                    borderTopColor: 'var(--brand-hover)',
                    animation: 'spin 0.8s linear infinite',
                    marginBottom: 20,
                  }}
                />
                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    marginBottom: 8,
                  }}
                >
                  Analyzing your code...
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>
                  LLaMA 3.3 70B is reviewing every line
                </p>
              </div>
            )}

            {review && !loading && (
              <>
                <div style={S.tabs}>
                  <button
                    style={activeTab === 'review' ? S.tabActive : S.tabInactive}
                    onClick={() => setActiveTab('review')}
                  >
                    📊 Results
                  </button>

                  <button
                    style={activeTab === 'diff' ? S.tabActive : S.tabInactive}
                    onClick={() => setActiveTab('diff')}
                  >
                    🔄 Diff View
                  </button>
                </div>

                {activeTab === 'review' && <ReviewPanel review={review} />}

                {activeTab === 'diff' && (
                  <DiffView originalCode={code} review={review} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}