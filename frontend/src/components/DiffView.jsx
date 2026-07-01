import { useState } from 'react';

export default function DiffView({ originalCode, review }) {
  const [selected, setSelected] = useState(0);

  if (!originalCode || !review?.suggestions?.length) {
    return (
      <div
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
          borderRadius: 14,
          padding: 40,
          textAlign: 'center',
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        <p style={{ color: 'var(--text-faint)', fontSize: 14 }}>
          No refactored code available
        </p>
      </div>
    );
  }

  const suggestionsWithFix = review.suggestions.filter((s) =>
    s.refactoredCode?.trim()
  );

  if (suggestionsWithFix.length === 0) {
    return (
      <div
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
          borderRadius: 14,
          padding: 40,
          textAlign: 'center',
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        <p style={{ color: 'var(--text-faint)', fontSize: 14 }}>
          No refactored code available for this review
        </p>
      </div>
    );
  }

  const safeSelected = Math.min(selected, suggestionsWithFix.length - 1);
  const activeSuggestion = suggestionsWithFix[safeSelected];
  const origLines = originalCode.split('\n');
  const fixLines = activeSuggestion.refactoredCode.split('\n');

  const severityColor = {
    high: {
      text: 'var(--danger-text)',
      bg: 'var(--danger-tint-10)',
      border: 'var(--danger-tint-25)',
    },
    medium: {
      text: 'var(--warning-text)',
      bg: 'var(--warning-tint-10)',
      border: 'var(--warning-tint-25)',
    },
    low: {
      text: 'var(--success-text)',
      bg: 'var(--success-tint-10)',
      border: 'var(--success-tint-25)',
    },
  };

  const renderCodeLines = (lines, type) => {
    const isOriginal = type === 'original';

    return (
      <div
        style={{
          background: 'var(--bg-code)',
          padding: '12px 8px',
          height: 360,
          maxHeight: 360,
          overflowY: 'auto',
          overflowX: 'hidden',
          minWidth: 0,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 10,
              minHeight: 20,
              alignItems: 'flex-start',
              width: '100%',
              minWidth: 0,
            }}
          >
            <span
              style={{
                color: 'var(--text-faint)',
                fontSize: 11,
                minWidth: 28,
                textAlign: 'right',
                fontFamily: "'JetBrains Mono', monospace",
                userSelect: 'none',
                flexShrink: 0,
                paddingTop: 1,
              }}
            >
              {i + 1}
            </span>

            <pre
              style={{
                fontSize: 12,
                color: isOriginal ? 'var(--danger-text)' : 'var(--success-code)',
                fontFamily: "'JetBrains Mono', monospace",
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
                margin: 0,
                lineHeight: 1.6,
                flex: 1,
                minWidth: 0,
                maxWidth: '100%',
                tabSize: 2,
              }}
            >
              {line || ' '}
            </pre>
          </div>
        ))}
      </div>
    );
  };

  const renderPanelHeader = (type, lineCount) => {
    const isOriginal = type === 'original';

    return (
      <div
        style={{
          padding: '8px 14px',
          background: isOriginal
            ? 'var(--danger-tint-06)'
            : 'var(--success-tint-06)',
          borderBottom: isOriginal
            ? '1px solid var(--danger-tint-15)'
            : '1px solid var(--success-tint-15)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          minWidth: 0,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: isOriginal ? 'var(--danger)' : 'var(--success)',
            flexShrink: 0,
          }}
        />

        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: isOriginal ? 'var(--danger)' : 'var(--success)',
            whiteSpace: 'nowrap',
          }}
        >
          {isOriginal ? 'Original Code' : 'Suggested Fix'}
        </span>

        <span
          style={{
            marginLeft: 'auto',
            fontSize: 10,
            color: 'var(--text-faint)',
            fontFamily: "'JetBrains Mono', monospace",
            whiteSpace: 'nowrap',
          }}
        >
          {lineCount} lines
        </span>
      </div>
    );
  };

  return (
    <div
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden',
        fontFamily: "'Outfit', sans-serif",
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-elevated)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--text-heading)',
            margin: 0,
          }}
        >
          🔄 Side-by-Side Diff View
        </h3>

        <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>
          {suggestionsWithFix.length} fix
          {suggestionsWithFix.length !== 1 ? 'es' : ''} available
        </span>
      </div>

      {/* Suggestion Selector */}
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          maxHeight: 220,
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-faint)',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 10,
          }}
        >
          Select Issue to View Fix
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {suggestionsWithFix.map((s, i) => {
            const sc = severityColor[s.severity] || severityColor.low;
            const isActive = safeSelected === i;

            return (
              <button
                key={i}
                onClick={() => setSelected(i)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  minHeight: 44,
                  padding: '9px 14px',
                  borderRadius: 9,
                  cursor: 'pointer',
                  background: isActive
                    ? 'var(--brand-tint-08)'
                    : 'var(--surface-02)',
                  border: isActive
                    ? '1px solid var(--brand-tint-30)'
                    : '1px solid var(--border-soft)',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'background 0.2s, border-color 0.2s',
                  minWidth: 0,
                  boxSizing: 'border-box',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--surface-04)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--surface-02)';
                  }
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: isActive
                      ? 'var(--brand-primary)'
                      : 'var(--surface-15)',
                  }}
                />

                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 100,
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    flexShrink: 0,
                    background: sc.bg,
                    color: sc.text,
                    border: `1px solid ${sc.border}`,
                  }}
                >
                  {s.severity}
                </span>

                {s.line > 0 && (
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--text-faint)',
                      fontFamily: "'JetBrains Mono', monospace",
                      flexShrink: 0,
                    }}
                  >
                    Line {s.line}
                  </span>
                )}

                <span
                  style={{
                    fontSize: 12,
                    color: isActive
                      ? 'var(--text-secondary)'
                      : 'var(--text-muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {s.issue}
                </span>

                {isActive && (
                  <span
                    style={{
                      color: 'var(--brand-primary)',
                      fontSize: 12,
                      flexShrink: 0,
                    }}
                  >
                    →
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active suggestion info */}
      <div
        style={{
          padding: '12px 20px',
          background: 'var(--brand-tint-03)',
          borderBottom: '1px solid var(--border-soft)',
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
        }}
      >
        <span
          style={{
            color: 'var(--success)',
            fontSize: 13,
            flexShrink: 0,
            marginTop: 1,
          }}
        >
          ✅
        </span>

        <p
          style={{
            fontSize: 13,
            color: 'var(--success-text)',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {activeSuggestion.suggestion}
        </p>
      </div>

      {/* Diff panels */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          width: '100%',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        {/* Original */}
        <div
          style={{
            borderRight: '1px solid var(--border-soft)',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          {renderPanelHeader('original', origLines.length)}
          {renderCodeLines(origLines, 'original')}
        </div>

        {/* Suggested Fix */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          {renderPanelHeader('fix', fixLines.length)}
          {renderCodeLines(fixLines, 'fix')}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '10px 20px',
          background: 'var(--bg-elevated)',
          borderTop: '1px solid var(--border-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
          Showing fix {safeSelected + 1} of {suggestionsWithFix.length}
        </span>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setSelected((i) => Math.max(0, i - 1))}
            disabled={safeSelected === 0}
            style={{
              padding: '5px 14px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              background: 'var(--surface-04)',
              border: '1px solid var(--border-strong)',
              color:
                safeSelected === 0
                  ? 'var(--text-faint)'
                  : 'var(--text-secondary)',
              cursor: safeSelected === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            ← Prev
          </button>

          <button
            onClick={() =>
              setSelected((i) => Math.min(suggestionsWithFix.length - 1, i + 1))
            }
            disabled={safeSelected === suggestionsWithFix.length - 1}
            style={{
              padding: '5px 14px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              background: 'var(--surface-04)',
              border: '1px solid var(--border-strong)',
              color:
                safeSelected === suggestionsWithFix.length - 1
                  ? 'var(--text-faint)'
                  : 'var(--text-secondary)',
              cursor:
                safeSelected === suggestionsWithFix.length - 1
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
