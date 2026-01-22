import { useEffect, useRef } from 'react';
import { colors } from '../../theme/colors';

interface LoadingSplashProps {
  visible: boolean;
  success?: boolean;
  error?: boolean;
  message?: string;
  onComplete?: () => void;
}

export function LoadingSplash({ visible, success, error, message, onComplete }: LoadingSplashProps) {
  const statusColor = success ? colors.success : error ? colors.danger : colors.accent;
  const statusText = success ? 'Acceso correcto' : error ? 'Error' : 'Procesando';
  const shouldAutoClose = success || error;
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!visible || !shouldAutoClose || !onComplete) return;
    // Error: 3 segundos para leer el mensaje, Éxito: 1.2 segundos
    const duration = error ? 3000 : 1200;
    timeoutRef.current = window.setTimeout(onComplete, duration);
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, shouldAutoClose, onComplete, error]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={onComplete}
    >
      <div
        style={{
          background: '#fff',
          padding: 32,
          borderRadius: 20,
          width: 'min(360px, 90%)',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: `${statusColor}22`,
            margin: '0 auto 16px',
            display: 'grid',
            placeItems: 'center',
            color: statusColor,
            fontWeight: 700,
            fontSize: 24,
          }}
        >
          {success ? '✓' : error ? '!' : '…'}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{statusText}</div>
        <div style={{ fontSize: 14, color: colors.textSecondary }}>
          {message || (success ? 'Bienvenido a CAIL' : 'Validando credenciales')}
        </div>
        {(success || error) && (
          <button
            type="button"
            style={{
              marginTop: 20,
              padding: '10px 16px',
              borderRadius: 10,
              border: `1px solid ${colors.border}`,
              background: colors.surfaceMuted,
              cursor: 'pointer',
            }}
            onClick={onComplete}
          >
            Continuar
          </button>
        )}
      </div>
    </div>
  );
}
