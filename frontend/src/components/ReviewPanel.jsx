import { useState } from 'react';
import SeverityBadge from './SeverityBadge';

const getQuality = (score) => {
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
};

export default function ReviewPanel({ review }) {
  const [expanded, setExpanded] = useState(null);

  if (!review) return null;

  const highCount = review.suggestions?.filter((s) => s.severity === 'high').length || 0;
  const mediumCount = review.suggestions?.filter((s) => s.severity === 'medium').length || 0;
  const lowCount = review.suggestions?.filter((s) => s.severity === 'low').length || 0;
  const quality = getQuality(review.overallScore);

  const progressGradient =
    review.overallScore >= 70
      ? 'linear-gradient(90deg,var(--success-strong),var(--success))'
      : review.overallScore >= 40
        ? 'linear-gradient(90deg,var(--warning-strong),var(--yellow))'
        : 'linear-gradient(90deg,var(--danger-strong),var(--danger))';

  const severityCards = [
    { count: highCount, label: 'High', color: 'var(--danger)', bg: 'var(--danger-tint-06)', border: 'var(--danger-tint-15)' },
    { count: mediumCount, label: 'Medium', color: 'var(--warning)', bg: 'var(--warning-tint-06)', border: 'var(--warning-tint-15)' },
    { count: lowCount, label: 'Low', color: 'var(--success)', bg: 'var(--success-tint-06)', border: 'var(--success-tint-15)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeUp 0.4s ease' }}>
      <div
        style={{
          background: 'linear-gradient(145deg, var(--bg-panel), var(--surface-03))',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 24,
          boxShadow: 'var(--shadow)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 19, fontWeight: 850, color: 'var(--text-heading)', marginBottom: 5 }}>
              Review Results
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>
              {review.language && review.language !== 'unknown' && (
                <span style={{ color: 'var(--brand-primary)', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                  {review.language} ·{' '}
                </span>
              )}
              {review.suggestions?.length || 0} issues found
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 50, fontWeight: 900, color: quality.color, lineHeight: 1, letterSpacing: -2 }}>
              {review.overallScore}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-faint)', fontWeight: 700, marginBottom: 8 }}>/ 100</div>
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
        </div>

        <div style={{ height: 6, background: 'var(--border-soft)', borderRadius: 999, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ height: '100%', borderRadius: 999, background: progressGradient, width: `${review.overallScore}%` }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
          {severityCards.map(({ count, label, color, bg, border }) => (
            <div
              key={label}
              style={{
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: 12,
                padding: '14px 10px',
                textAlign: 'center',
                boxShadow: 'inset 0 1px 0 var(--surface-10)',
              }}
            >
              <div style={{ fontSize: 30, fontWeight: 900, color, lineHeight: 1 }}>{count}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 850, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, boxShadow: 'var(--shadow)' }}>
        <h3 style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, fontWeight: 800 }}>
          AI Summary
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{review.summary}</p>
      </div>

      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, boxShadow: 'var(--shadow)' }}>
        <h3 style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14, fontWeight: 800 }}>
          Suggestions ({review.suggestions?.length || 0})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {review.suggestions?.map((s, i) => {
            const borderColor = s.severity === 'high' ? 'var(--danger)' : s.severity === 'medium' ? 'var(--warning)' : 'var(--success)';
            return (
              <div
                key={i}
                style={{
                  borderLeft: `3px solid ${borderColor}`,
                  background: 'var(--bg-card)',
                  borderRadius: '0 12px 12px 0',
                  overflow: 'hidden',
                  borderTop: '1px solid var(--border-soft)',
                  borderRight: '1px solid var(--border-soft)',
                  borderBottom: '1px solid var(--border-soft)',
                }}
              >
                <button
                  onClick={() => setExpanded(expanded === i ? null : i)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    padding: '13px 16px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, flexWrap: 'wrap' }}>
                        <SeverityBadge severity={s.severity} />
                        {s.line > 0 && <span style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: "'JetBrains Mono', monospace" }}>Line {s.line}</span>}
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{s.issue}</p>
                    </div>
                    <span style={{ color: 'var(--text-faint)', fontSize: 12, flexShrink: 0 }}>{expanded === i ? '▲' : '▼'}</span>
                  </div>
                </button>

                {expanded === i && (
                  <div style={{ borderTop: '1px solid var(--border-soft)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <p style={{ fontSize: 13, color: 'var(--success-text)', lineHeight: 1.55, margin: 0 }}>✅ {s.suggestion}</p>
                    {s.refactoredCode && (
                      <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-soft)' }}>
                        <div style={{ background: 'var(--bg-elevated)', padding: '7px 12px', fontSize: 11, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)' }} />
                          Suggested Fix
                        </div>
                        <pre style={{ background: 'var(--bg-code)', padding: 12, fontSize: 12, color: 'var(--brand-cyan)', fontFamily: "'JetBrains Mono', monospace", overflowX: 'hidden', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere', lineHeight: 1.6, margin: 0 }}>
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
