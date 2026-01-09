import { ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonTone = 'candidate' | 'employer' | 'neutral';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: React.CSSProperties;
}

const toneStyles = {
  candidate: {
    main: '#1A936F',
    surface: '#E1F4EB',
    contrast: '#FFFFFF',
    gradient: 'linear-gradient(90deg, #16A968 0%, #1EC890 100%)',
  },
  employer: {
    main: '#F1842D',
    surface: '#FFE6D6',
    contrast: '#FFFFFF',
    gradient: 'linear-gradient(90deg, #F07F2D 0%, #F4B25D 100%)',
  },
  neutral: {
    main: '#0F172A',
    surface: '#F6F8FD',
    contrast: '#FFFFFF',
    gradient: 'linear-gradient(90deg, #0F172A 0%, #0F172A 100%)',
  },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  tone = 'candidate',
  icon,
  loading,
  disabled,
  fullWidth,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const tokens = toneStyles[tone];
  const shouldUseGradient = variant === 'primary' && tone !== 'neutral';

  const getStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '13px 18px',
      borderRadius: '18px',
      fontSize: '16px',
      fontWeight: 600,
      border: 'none',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.6 : 1,
      transition: 'all 0.2s',
      fontFamily: 'inherit',
      width: fullWidth ? '100%' : 'auto',
    };

    if (variant === 'primary') {
      if (shouldUseGradient) {
        return {
          ...base,
          background: tokens.gradient,
          color: tokens.contrast,
          boxShadow: '0 8px 14px rgba(15, 23, 42, 0.12)',
        };
      }
      return {
        ...base,
        backgroundColor: tokens.main,
        color: tokens.contrast,
      };
    }

    if (variant === 'secondary') {
      return {
        ...base,
        backgroundColor: tone === 'neutral' ? '#F6F8FD' : tokens.surface,
        color: tone === 'neutral' ? '#0F172A' : tokens.main,
        border: `1px solid ${tone === 'neutral' ? '#DFE7F5' : tokens.main}`,
      };
    }

    // ghost
    return {
      ...base,
      backgroundColor: 'transparent',
      color: tone === 'neutral' ? '#0F172A' : tokens.main,
      border: `1px solid ${tone === 'neutral' ? '#DFE7F5' : tokens.main}`,
    };
  };

  return (
    <button onClick={onPress} disabled={isDisabled} style={{ ...getStyles(), ...style }}>
      {loading ? (
        'Cargando...'
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </button>
  );
}
