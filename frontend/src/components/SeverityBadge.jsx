export default function SeverityBadge({ severity }) {
  const key = severity || 'low';

  const styles = {
    high: {
      icon: '🔴',
      background: 'var(--danger-tint-10)',
      color: 'var(--danger-text)',
      border: '1px solid var(--danger-tint-25)',
    },
    medium: {
      icon: '🟡',
      background: 'var(--warning-tint-10)',
      color: 'var(--warning-text)',
      border: '1px solid var(--warning-tint-25)',
    },
    low: {
      icon: '🟢',
      background: 'var(--success-tint-10)',
      color: 'var(--success-text)',
      border: '1px solid var(--success-tint-25)',
    },
  };

  const style = styles[key] || styles.low;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 10.5,
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: 0.9,
        background: style.background,
        color: style.color,
        border: style.border,
        lineHeight: 1.3,
      }}
    >
      <span>{style.icon}</span>
      {key}
    </span>
  );
}
