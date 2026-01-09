interface ChipProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'gray';
  onRemove?: () => void;
}

const variantColors: Record<NonNullable<ChipProps['variant']>, { bg: string; text: string }> = {
  primary: { bg: '#E1F4EB', text: '#0B6E4F' },
  secondary: { bg: '#FFE6D6', text: '#C45C12' },
  success: { bg: '#D1FAE5', text: '#15803D' },
  warning: { bg: '#FEF3C7', text: '#D97706' },
  danger: { bg: '#FCE7F3', text: '#BE123C' },
  gray: { bg: '#F3F4F6', text: '#374151' },
};

export function Chip({ label, variant = 'gray', onRemove }: ChipProps) {
  const colors = variantColors[variant];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '9999px',
        fontSize: '0.875rem',
        fontWeight: 500,
        background: colors.bg,
        color: colors.text,
      }}
    >
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            color: 'inherit',
            opacity: 0.7,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </span>
  );
}
