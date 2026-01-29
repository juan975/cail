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
  const isProcessing = visible && !success && !error;
  const statusColor = success ? colors.success : error ? colors.danger : colors.accent;
  const statusText = success ? 'Acceso correcto' : error ? 'Error' : 'Procesando';
  const shouldAutoClose = success || error;
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Solo iniciar el temporizador si estamos en un estado final (éxito o error)
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
        zIndex: 100,
        backdropFilter: 'blur(4px)',
      }}
      onClick={shouldAutoClose ? onComplete : undefined}
    >
      <div
        style={{
          background: '#fff',
          padding: 32,
          borderRadius: 24,
          width: 'min(400px, 90%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          textAlign: 'center',
          transform: 'scale(1)',
          transition: 'transform 0.3s ease',
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: `${statusColor}15`,
            margin: '0 auto 24px',
            display: 'grid',
            placeItems: 'center',
            color: statusColor,
            fontWeight: 700,
            fontSize: 32,
            position: 'relative'
          }}
        >
          {isProcessing ? (
            <div className="splash-spinner" />
          ) : success ? (
            '✓'
          ) : (
            '!'
          )}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: '#1E293B' }}>{statusText}</div>
        <div style={{ fontSize: 15, color: colors.textSecondary, lineHeight: 1.5, padding: '0 10px' }}>
          {message || (success ? 'Bienvenido a CAIL. Redirigiendo...' : 'Validando sus credenciales...')}
        </div>
        
        {shouldAutoClose && (
          <button
            type="button"
            style={{
              marginTop: 28,
              padding: '12px 24px',
              borderRadius: 12,
              border: `1px solid ${colors.border}`,
              background: '#F8FAFC',
              cursor: 'pointer',
              fontWeight: 600,
              color: '#475569',
              transition: 'all 0.2s ease',
            }}
            onClick={onComplete}
          >
            Continuar
          </button>
        )}

        <style>{`
          .splash-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid ${colors.accent}20;
            border-top: 4px solid ${colors.accent};
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
