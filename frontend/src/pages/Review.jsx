import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeCode, getRepos, getRepoContents, getFileContent } from '../services/api';
import { detectLanguage } from '../utils/languageDetect';

const LANG_COLORS = { javascript: '#F6E05E', typescript: '#63B3ED', python: '#68D391', java: '#F6AD55', cpp: '#FC8181', c: '#B794F4', go: '#76E4F7', rust: '#F6AD55', php: '#B794F4', unknown: '#718096' };

function SeverityBadge({ severity }) {
  const styles = {
    high:   { background: 'rgba(252,129,129,0.1)', color: '#FEB2B2', border: '1px solid rgba(252,129,129,0.25)' },
    medium: { background: 'rgba(246,173,85,0.1)',  color: '#FBD38D', border: '1px solid rgba(246,173,85,0.25)' },
    low:    { background: 'rgba(104,211,145,0.1)', color: '#9AE6B4', border: '1px solid rgba(104,211,145,0.25)' },
  };
  return (
    <span style={{ ...styles[severity] || styles.low, padding: '2px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
      {severity}
    </span>
  );
}

function ScoreRing({ score }) {
  const color = score >= 70 ? '#68D391' : score >= 40 ? '#F6E05E' : '#FC8181';
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: 48, fontWeight: 800, color, letterSpacing: -2, lineHeight: 1 }}>{score}</div>
      <div style={{ fontSize: 13, color: '#4A5568', marginTop: 2 }}>/ 100</div>
    </div>
  );
}

function ReviewPanel({ review }) {
  const [expanded, setExpanded] = useState(null);
  if (!review) return null;
  const high = review.suggestions?.filter(s => s.severity === 'high').length || 0;
  const med  = review.suggestions?.filter(s => s.severity === 'medium').length || 0;
  const low  = review.suggestions?.filter(s => s.severity === 'low').length || 0;
  const scoreColor = review.overallScore >= 70 ? '#68D391' : review.overallScore >= 40 ? '#F6E05E' : '#FC8181';
  const progressColor = review.overallScore >= 70 ? 'linear-gradient(90deg,#38A169,#68D391)' : review.overallScore >= 40 ? 'linear-gradient(90deg,#B7791F,#F6E05E)' : 'linear-gradient(90deg,#C53030,#FC8181)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeUp 0.4s ease' }}>
      {/* Score card */}
      <div style={{ background: '#0F1625', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#F7FAFC', marginBottom: 4 }}>Review Results</h2>
            <p style={{ fontSize: 13, color: '#4A5568' }}>
              {review.language && review.language !== 'unknown' && <span style={{ color: '#63B3ED', fontFamily: "'JetBrains Mono',monospace" }}>{review.language} · </span>}
              {review.suggestions?.length || 0} issues found
            </p>
          </div>
          <ScoreRing score={review.overallScore} />
        </div>
        {/* Progress bar */}
        <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ height: '100%', borderRadius: 3, background: progressColor, width: `${review.overallScore}%`, transition: 'width 1s ease' }} />
        </div>
        {/* Severity counts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            { count: high, label: 'High', color: '#FC8181', bg: 'rgba(252,129,129,0.06)', border: 'rgba(252,129,129,0.15)' },
            { count: med,  label: 'Medium', color: '#F6AD55', bg: 'rgba(246,173,85,0.06)', border: 'rgba(246,173,85,0.15)' },
            { count: low,  label: 'Low', color: '#68D391', bg: 'rgba(104,211,145,0.06)', border: 'rgba(104,211,145,0.15)' },
          ].map(({ count, label, color, bg, border }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color }}>{count}</div>
              <div style={{ fontSize: 11, color: '#4A5568', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div style={{ background: '#0F1625', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 11, color: '#4A5568', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>AI Summary</div>
        <p style={{ fontSize: 14, color: '#CBD5E0', lineHeight: 1.7 }}>{review.summary}</p>
      </div>

      {/* Suggestions */}
      <div style={{ background: '#0F1625', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 11, color: '#4A5568', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14, fontWeight: 600 }}>
          Suggestions ({review.suggestions?.length || 0})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {review.suggestions?.map((s, i) => {
            const borderColor = s.severity === 'high' ? '#FC8181' : s.severity === 'medium' ? '#F6AD55' : '#68D391';
            return (
              <div key={i} onClick={() => setExpanded(expanded === i ? null : i)}
                style={{ borderLeft: `2px solid ${borderColor}`, background: '#080C18', borderRadius: '0 10px 10px 0', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateX(3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
              >
                <div style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <SeverityBadge severity={s.severity} />
                      {s.line > 0 && <span style={{ fontSize: 11, color: '#4A5568', fontFamily: "'JetBrains Mono',monospace" }}>Line {s.line}</span>}
                    </div>
                    <span style={{ color: '#4A5568', fontSize: 12 }}>{expanded === i ? '▲' : '▼'}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#CBD5E0', lineHeight: 1.5 }}>{s.issue}</p>
                </div>
                {expanded === i && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ color: '#68D391', flexShrink: 0 }}>✅</span>
                      <p style={{ fontSize: 13, color: '#9AE6B4', lineHeight: 1.5 }}>{s.suggestion}</p>
                    </div>
                    {s.refactoredCode && (
                      <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ background: '#0C1220', padding: '6px 12px', fontSize: 11, color: '#4A5568', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#68D391', display: 'inline-block' }} />
                          Suggested Fix
                        </div>
                        <pre style={{ background: '#020408', padding: 12, fontSize: 12, color: '#7EC8E3', fontFamily: "'JetBrains Mono',monospace", overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0 }}>
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

function DiffView({ originalCode, review }) {
  const [selected, setSelected] = useState(0);

  if (!originalCode || !review?.suggestions?.length) return (
    <div style={{ background: '#0F1625', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 40, textAlign: 'center' }}>
      <p style={{ color: '#4A5568', fontSize: 14 }}>No refactored code available</p>
    </div>
  );

  const suggestionsWithFix = review.suggestions.filter(s => s.refactoredCode?.trim());

  if (suggestionsWithFix.length === 0) return (
    <div style={{ background: '#0F1625', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 40, textAlign: 'center' }}>
      <p style={{ color: '#4A5568', fontSize: 14 }}>No refactored code available for this review</p>
    </div>
  );

  const activeSuggestion = suggestionsWithFix[selected];
  const origLines = originalCode.split('\n');
  const fixLines  = activeSuggestion.refactoredCode.split('\n');

  const severityColor = {
    high:   { text: '#FEB2B2', bg: 'rgba(252,129,129,0.1)', border: 'rgba(252,129,129,0.25)' },
    medium: { text: '#FBD38D', bg: 'rgba(246,173,85,0.1)',  border: 'rgba(246,173,85,0.25)' },
    low:    { text: '#9AE6B4', bg: 'rgba(104,211,145,0.1)', border: 'rgba(104,211,145,0.25)' },
  };

  return (
    <div style={{ background: '#0F1625', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden', fontFamily: "'Outfit', sans-serif" }}>

      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#0C1220', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#F7FAFC', margin: 0 }}>🔄 Side-by-Side Diff View</h3>
        <span style={{ fontSize: 12, color: '#4A5568' }}>{suggestionsWithFix.length} fix{suggestionsWithFix.length !== 1 ? 'es' : ''} available</span>
      </div>

      {/* Suggestion Selector */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontSize: 11, color: '#4A5568', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>
          Select Issue to View Fix
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {suggestionsWithFix.map((s, i) => {
            const sc = severityColor[s.severity] || severityColor.low;
            const isActive = selected === i;
            return (
              <button key={i} onClick={() => setSelected(i)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 9, cursor: 'pointer',
                background: isActive ? 'rgba(79,156,249,0.08)' : 'rgba(255,255,255,0.02)',
                border: isActive ? '1px solid rgba(79,156,249,0.3)' : '1px solid rgba(255,255,255,0.06)',
                textAlign: 'left', width: '100%', transition: 'all 0.2s',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: isActive ? '#4F9CF9' : 'rgba(255,255,255,0.15)' }} />
                <span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, flexShrink: 0, background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                  {s.severity}
                </span>
                {s.line > 0 && <span style={{ fontSize: 11, color: '#4A5568', fontFamily: "'JetBrains Mono',monospace", flexShrink: 0 }}>Line {s.line}</span>}
                <span style={{ fontSize: 12, color: isActive ? '#CBD5E0' : '#718096', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{s.issue}</span>
                {isActive && <span style={{ color: '#4F9CF9', fontSize: 12, flexShrink: 0 }}>→</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active fix description */}
      <div style={{ padding: '12px 20px', background: 'rgba(79,156,249,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
        <span style={{ color: '#34D399', fontSize: 13, flexShrink: 0 }}>✅</span>
        <p style={{ fontSize: 13, color: '#9AE6B4', lineHeight: 1.6, margin: 0 }}>{activeSuggestion.suggestion}</p>
      </div>

      {/* Diff panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {/* Original */}
        <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ padding: '8px 14px', background: 'rgba(252,129,129,0.06)', borderBottom: '1px solid rgba(252,129,129,0.15)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FC8181' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#FC8181' }}>Original Code</span>
            <span style={{ marginLeft: 'auto', fontSize: 10, color: '#4A5568', fontFamily: "'JetBrains Mono',monospace" }}>{origLines.length} lines</span>
          </div>
          <div style={{ background: '#020408', padding: '12px 8px', maxHeight: 400, overflowY: 'auto', overflowX: 'auto' }}>
            {origLines.map((line, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, minHeight: 20 }}>
                <span style={{ color: '#334155', fontSize: 11, minWidth: 28, textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", userSelect: 'none', flexShrink: 0 }}>{i + 1}</span>
                <pre style={{ fontSize: 12, color: '#FCA5A5', fontFamily: "'JetBrains Mono',monospace", whiteSpace: 'pre', margin: 0, flex: 1 }}>{line || ' '}</pre>
              </div>
            ))}
          </div>
        </div>

        {/* Refactored */}
        <div>
          <div style={{ padding: '8px 14px', background: 'rgba(52,211,153,0.06)', borderBottom: '1px solid rgba(52,211,153,0.15)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#34D399' }}>Suggested Fix</span>
            <span style={{ marginLeft: 'auto', fontSize: 10, color: '#4A5568', fontFamily: "'JetBrains Mono',monospace" }}>{fixLines.length} lines</span>
          </div>
          <div style={{ background: '#020408', padding: '12px 8px', maxHeight: 400, overflowY: 'auto', overflowX: 'auto' }}>
            {fixLines.map((line, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, minHeight: 20 }}>
                <span style={{ color: '#334155', fontSize: 11, minWidth: 28, textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", userSelect: 'none', flexShrink: 0 }}>{i + 1}</span>
                <pre style={{ fontSize: 12, color: '#6EE7B7', fontFamily: "'JetBrains Mono',monospace", whiteSpace: 'pre', margin: 0, flex: 1 }}>{line || ' '}</pre>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer nav */}
      <div style={{ padding: '8px 20px', background: '#0C1220', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: '#334155' }}>Showing fix {selected + 1} of {suggestionsWithFix.length}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setSelected(i => Math.max(0, i - 1))} disabled={selected === 0}
            style={{ padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: selected === 0 ? '#334155' : '#A0AEC0', cursor: selected === 0 ? 'not-allowed' : 'pointer' }}>
            ← Prev
          </button>
          <button onClick={() => setSelected(i => Math.min(suggestionsWithFix.length - 1, i + 1))} disabled={selected === suggestionsWithFix.length - 1}
            style={{ padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: selected === suggestionsWithFix.length - 1 ? '#334155' : '#A0AEC0', cursor: selected === suggestionsWithFix.length - 1 ? 'not-allowed' : 'pointer' }}>
            Next →
          </button>
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
  const [activeTab, setActiveTab] = useState('review');
  const [showRepo, setShowRepo] = useState(false);
  const [repos, setRepos] = useState([]);
  const [repoLoading, setRepoLoading] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [contents, setContents] = useState([]);

  if (!token) { navigate('/login'); return null; }

  const handleCodeChange = (val) => {
    setCode(val);
    setLanguage(detectLanguage(val));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => handleCodeChange(ev.target.result);
    reader.readAsText(file);
    setTitle(file.name);
  };

  const loadRepos = async () => {
    setRepoLoading(true);
    try {
      const { data } = await getRepos();
      setRepos(data);
    } catch { setError('Failed to load repos. Make sure you logged in with GitHub.'); }
    finally { setRepoLoading(false); }
  };

  const toggleRepo = () => {
    if (!showRepo && repos.length === 0) loadRepos();
    setShowRepo(!showRepo);
  };

  

  const browseRepo = async (repo, path = '') => {
    try {
      const { data } = await getRepoContents(repo.owner.login, repo.name, path);
      setContents(Array.isArray(data) ? data : [data]);
      setSelectedRepo({ repo, path });
    } catch { setError('Failed to load files.'); }
  };

  const pickFile = async (item) => {
    if (item.type === 'dir') { browseRepo(selectedRepo.repo, item.path); return; }
    try {
      const { data } = await getFileContent(selectedRepo.repo.owner.login, selectedRepo.repo.name, item.path);
      handleCodeChange(data.content);
      setTitle(item.name);
      setShowRepo(false);
    } catch { setError('Failed to load file.'); }
  };

  const handleAnalyze = async () => {
    if (!code.trim()) { setError('Please enter some code.'); return; }
    setLoading(true); setError(''); setReview(null);
    try {
      const { data } = await analyzeCode({ code, language: language || 'unknown', title: title || 'Untitled Review', sourceType: 'paste' });
      setReview(data); setActiveTab('review');
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally { setLoading(false); }
  };

  const langColor = LANG_COLORS[language] || '#718096';

  const S = {
    page: { minHeight: '100vh', background: '#04060D', fontFamily: "'Outfit', sans-serif" },
    container: { maxWidth: 1280, margin: '0 auto', padding: '32px 24px' },
    header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 },
    title: { fontSize: 28, fontWeight: 800, color: '#F7FAFC', letterSpacing: -0.5 },
    subtitle: { fontSize: 14, color: '#4A5568', marginTop: 4 },
    historyBtn: {
      padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      color: '#A0AEC0', cursor: 'pointer', textDecoration: 'none',
      display: 'inline-flex', alignItems: 'center', gap: 6,
    },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
    inputStyle: {
      width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
      background: '#0F1625', border: '1px solid rgba(255,255,255,0.07)',
      color: '#E2E8F0', outline: 'none', boxSizing: 'border-box', marginBottom: 12,
    },
    githubBtn: {
      padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      color: '#A0AEC0', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
      transition: 'all 0.2s', marginBottom: 12,
    },
    codeWrap: { background: '#0F1625', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
    codeHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0C1220' },
    codeLabel: { fontSize: 13, fontWeight: 600, color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: 8 },
    langBadge: { padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" },
    codeActions: { display: 'flex', gap: 6 },
    actionBtn: { padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#718096', cursor: 'pointer' },
    textarea: {
      width: '100%', height: 340, padding: '16px', fontSize: 13, lineHeight: 1.8,
      background: '#020408', border: 'none', color: '#7EC8E3',
      fontFamily: "'JetBrains Mono',monospace", resize: 'none', outline: 'none',
      boxSizing: 'border-box',
    },
    codeFooter: { padding: '6px 16px', background: '#0C1220', fontSize: 11, color: '#4A5568', textAlign: 'right', borderTop: '1px solid rgba(255,255,255,0.04)' },
    errorBox: {
      padding: '10px 14px', borderRadius: 10, marginBottom: 12,
      background: 'rgba(252,129,129,0.08)', border: '1px solid rgba(252,129,129,0.2)',
      color: '#FEB2B2', fontSize: 13,
    },
    analyzeBtn: {
      width: '100%', padding: '14px', borderRadius: 12, fontSize: 16, fontWeight: 700,
      background: 'linear-gradient(135deg, #3182CE, #6B46C1)',
      color: 'white', border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      boxShadow: '0 8px 28px rgba(49,130,206,0.3)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    emptyPanel: {
      background: '#0F1625', border: '1px dashed rgba(255,255,255,0.07)',
      borderRadius: 14, padding: 60, textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: 400,
    },
    loadingPanel: {
      background: '#0F1625', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14, padding: 60, textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: 400,
    },
    tabs: { display: 'flex', gap: 8, marginBottom: 14 },
    tabActive: { padding: '7px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: 'rgba(99,179,237,0.1)', border: '1px solid rgba(99,179,237,0.3)', color: '#63B3ED', cursor: 'pointer' },
    tabInactive: { padding: '7px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: 'transparent', border: '1px solid rgba(255,255,255,0.07)', color: '#4A5568', cursor: 'pointer' },
    repoPanel: { background: '#0C1220', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16, marginBottom: 12 },
    repoItem: { padding: '10px 14px', borderRadius: 9, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)', background: '#0F1625', marginBottom: 8, transition: 'all 0.2s' },
  };

  return (
    <div style={S.page}>
      <div style={S.container}>
        {/* Header */}
        <div style={S.header} className="fade-up">
          <div>
            <h1 style={S.title}>Code Review</h1>
            <p style={S.subtitle}>Paste code or load from GitHub for an instant AI review</p>
          </div>
          <button onClick={() => navigate('/history')} style={S.historyBtn}>📜 View History</button>
        </div>

        {/* Grid */}
        <div style={{ ...S.grid, gridTemplateColumns: window.innerWidth < 900 ? '1fr' : '1fr 1fr' }}>
          {/* LEFT */}
          <div className="fade-up-1">
            <input type="text" placeholder="Review title (optional)..." value={title}
              onChange={e => setTitle(e.target.value)} style={S.inputStyle}
              onFocus={e => { e.target.style.borderColor = 'rgba(99,179,237,0.4)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; }}
            />

            <button style={S.githubBtn} onClick={toggleRepo}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              {showRepo ? 'Hide GitHub Picker' : 'Load from GitHub'}
            </button>

            {/* Repo picker */}
            {showRepo && (
              <div style={S.repoPanel}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#A0AEC0', marginBottom: 10 }}>📁 Your Repositories</div>
                {repoLoading && <div style={{ color: '#4A5568', fontSize: 13 }}>Loading repos...</div>}
                {!selectedRepo && repos.map(repo => (
                  <div key={repo.id} style={S.repoItem}
                    onClick={() => browseRepo(repo)}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,179,237,0.3)'; e.currentTarget.style.background = '#141C2E'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.background = '#0F1625'; }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>{repo.name}</div>
                    <div style={{ fontSize: 12, color: '#4A5568', marginTop: 3 }}>{repo.language} · ⭐ {repo.stargazers_count}</div>
                  </div>
                ))}
                {selectedRepo && (
                  <>
                    <button onClick={() => setSelectedRepo(null)} style={{ background: 'none', border: 'none', color: '#63B3ED', fontSize: 13, cursor: 'pointer', marginBottom: 10 }}>← Back to repos</button>
                    <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                      {contents.map(item => (
                        <div key={item.sha} style={S.repoItem} onClick={() => pickFile(item)}
                          onMouseEnter={e => e.currentTarget.style.background = '#141C2E'}
                          onMouseLeave={e => e.currentTarget.style.background = '#0F1625'}
                        >
                          <span style={{ fontSize: 13, color: '#E2E8F0' }}>{item.type === 'dir' ? '📁' : '📄'} {item.name}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Code editor */}
            <div style={S.codeWrap}>
              <div style={S.codeHeader}>
                <div style={S.codeLabel}>
                  Your Code
                  {language && language !== 'unknown' && (
                    <span style={{ ...S.langBadge, background: `${langColor}18`, color: langColor, border: `1px solid ${langColor}30` }}>{language}</span>
                  )}
                </div>
                <div style={S.codeActions}>
                  <input type="file" ref={fileRef} style={{ display: 'none' }} onChange={handleFileUpload}
                    accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.php,.go,.rs,.html,.css" />
                  <button style={S.actionBtn} onClick={() => fileRef.current.click()}>📁 Upload</button>
                  <button style={S.actionBtn} onClick={() => { setCode(''); setLanguage(''); }}>🗑 Clear</button>
                </div>
              </div>
              <textarea
                style={S.textarea}
                placeholder="Paste your code here or upload a file..."
                value={code}
                onChange={e => handleCodeChange(e.target.value)}
                spellCheck={false}
              />
              <div style={S.codeFooter}>{code.split('\n').length} lines · {code.length} chars</div>
            </div>

            {error && <div style={S.errorBox}>⚠️ {error}</div>}

            <button
              onClick={handleAnalyze}
              disabled={loading || !code.trim()}
              style={{ ...S.analyzeBtn, opacity: loading || !code.trim() ? 0.5 : 1, cursor: loading || !code.trim() ? 'not-allowed' : 'pointer' }}
              onMouseEnter={e => { if (!loading && code.trim()) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(49,130,206,0.4)'; }}}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(49,130,206,0.3)'; }}
            >
              {loading ? <><span className="spinner" /> Analyzing your code...</> : <><span>⚡</span> Analyze Code</>}
            </button>

            {loading && (
              <div style={{ textAlign: 'center', marginTop: 10 }}>
                {['Scanning for bugs...', 'Checking best practices...', 'Generating suggestions...'].map((msg, i) => (
                  <div key={i} style={{ fontSize: 12, color: '#4A5568', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 6 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#3182CE', animation: 'pulse 1.5s ease infinite', animationDelay: `${i * 0.3}s` }} />
                    {msg}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="fade-up-2">
            {!review && !loading && (
              <div style={S.emptyPanel}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#2D3748', marginBottom: 8 }}>Ready to analyze</h3>
                <p style={{ fontSize: 14, color: '#2D3748', maxWidth: 260 }}>Paste your code and click Analyze Code to get AI-powered insights</p>
              </div>
            )}

            {loading && (
              <div style={S.loadingPanel}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', border: '3px solid rgba(49,130,206,0.2)', borderTopColor: '#3182CE', animation: 'spin 0.8s linear infinite', marginBottom: 20 }} />
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#A0AEC0', marginBottom: 8 }}>Analyzing your code...</h3>
                <p style={{ fontSize: 13, color: '#4A5568' }}>LLaMA 3.3 70B is reviewing every line</p>
              </div>
            )}

            {review && !loading && (
              <>
                <div style={S.tabs}>
                  <button style={activeTab === 'review' ? S.tabActive : S.tabInactive} onClick={() => setActiveTab('review')}>📊 Results</button>
                  <button style={activeTab === 'diff' ? S.tabActive : S.tabInactive} onClick={() => setActiveTab('diff')}>🔄 Diff View</button>
                </div>
                {activeTab === 'review' && <ReviewPanel review={review} />}
                {activeTab === 'diff' && <DiffView originalCode={code} review={review} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}