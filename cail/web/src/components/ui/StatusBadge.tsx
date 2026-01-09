import { colors } from '../../theme/colors';

interface StatusBadgeProps {
  label: string;
  tone?: 'success' | 'warning' | 'danger' | 'info';
}

const toneMap: Record<NonNullable<StatusBadgeProps['tone']>, { bg: string; text: string }> = {
  success: { bg: '#ECFDF5', text: '#059669' },
  warning: { bg: '#FFFBEB', text: '#F59E0B' },
  danger: { bg: '#FEF2F2', text: colors.danger },
  info: { bg: '#EFF6FF', text: colors.info },
};

export function StatusBadge({ label, tone = 'info' }: StatusBadgeProps) {
  const toneStyle = toneMap[tone];

  return (
    <span
      style={{
        padding: '6px 10px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        background: toneStyle.bg,
        color: toneStyle.text,
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {label}
    </span>
  );
}
