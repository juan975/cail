import { colors } from '../../theme/colors';

interface StatPillProps {
  label: string;
  value: string | number;
  tone?: 'candidate' | 'employer' | 'neutral';
}

export function StatPill({ label, value, tone = 'neutral' }: StatPillProps) {
  const toneStyles: Record<typeof tone, React.CSSProperties> = {
    candidate: { background: colors.candidateSurface, color: colors.candidateDark },
    employer: { background: colors.employerSurface, color: colors.employerDark },
    neutral: { background: colors.surfaceMuted, color: colors.textPrimary },
  };

  return (
    <div
      style={{
        padding: '10px 14px',
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        ...toneStyles[tone],
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
