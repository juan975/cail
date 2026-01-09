import { forwardRef, ReactNode, useState } from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  tone?: 'default' | 'employer' | 'candidate';
  readonly?: boolean;
  icon?: ReactNode;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, helperText, tone = 'default', readonly = false, icon, style, onFocus, onBlur, ...rest }, ref) => {
    const [focused, setFocused] = useState(false);
    const accent =
      tone === 'employer' ? '#F1842D' : tone === 'candidate' ? '#1A936F' : '#4F46E5';

    const isReadonly = readonly || rest.disabled;

    return (
      <div style={{ marginBottom: '16px' }}>
        {label && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {icon}
              <label
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#4C5672',
                }}
              >
                {label}
              </label>
            </div>
            {isReadonly && (
              <span
                style={{
                  backgroundColor: '#F3F4F6',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: '#4C5672',
                  textTransform: 'uppercase',
                }}
              >
                Solo lectura
              </span>
            )}
          </div>
        )}
        <div
          style={{
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: focused && !isReadonly ? accent : '#DFE7F5',
            borderRadius: '18px',
            backgroundColor: isReadonly ? '#F9FAFB' : '#FFFFFF',
            padding: '4px',
            boxShadow: focused && !isReadonly
              ? `0 0 0 3px ${accent}15`
              : '0 4px 12px rgba(15, 23, 42, 0.03)',
            transition: 'all 0.2s',
          }}
        >
          <input
            ref={ref}
            style={{
              width: '100%',
              padding: '12px 14px',
              fontSize: '15px',
              color: isReadonly ? '#4C5672' : '#0F172A',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontFamily: 'inherit',
              ...style,
            }}
            disabled={isReadonly}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...rest}
          />
        </div>
        {helperText && (
          <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px', margin: 0 }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
