import { colors } from '../../theme/colors';

interface ProgressBarProps {
  value: number;
  tone?: 'candidate' | 'employer' | 'neutral';
}

export function ProgressBar({ value, tone = 'candidate' }: ProgressBarProps) {
  const toneColor =
    tone === 'employer' ? colors.employer : tone === 'candidate' ? colors.candidate : colors.accent;

  return (
    <div style={{ height: 8, borderRadius: 999, background: colors.surfaceMuted, overflow: 'hidden' }}>
      <div
        style={{
          width: `${Math.min(100, Math.max(0, value * 100))}%`,
          height: '100%',
          background: toneColor,
        }}
      />
    </div>
  );
}
