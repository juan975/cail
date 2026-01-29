import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiInfo, FiX, FiXCircle } from 'react-icons/fi';

type NotificationVariant = 'success' | 'info' | 'warning' | 'danger';

type ToastOptions = {
  variant: NotificationVariant;
  title?: string;
  message: string;
  durationMs?: number;
};

type ModalOptions = {
  variant: NotificationVariant;
  title: string;
  message: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

type ConfirmOptions = Omit<ModalOptions, 'variant' | 'onConfirm' | 'onCancel'> & {
  variant?: NotificationVariant;
};

type NotificationsApi = {
  toast: (options: ToastOptions) => void;
  success: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  alert: (message: string, title?: string) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  setTheme: (theme: 'candidate' | 'employer' | 'default') => void;
};

type Toast = ToastOptions & { id: string; durationMs: number };

type ModalState = ModalOptions & {
  open: boolean;
};

const NotificationsContext = createContext<NotificationsApi | null>(null);

const defaultStyles: Record<
  NotificationVariant,
  { accent: string; soft: string; icon: JSX.Element; label: string }
> = {
  success: {
    accent: '#10B981',
    soft: '#ECFDF5',
    icon: <FiCheckCircle size={32} />,
    label: '¡Éxito!',
  },
  info: {
    accent: '#3B82F6',
    soft: '#EFF6FF',
    icon: <FiInfo size={32} />,
    label: 'Información',
  },
  warning: {
    accent: '#F59E0B',
    soft: '#FFFBEB',
    icon: <FiAlertTriangle size={32} />,
    label: 'Atención',
  },
  danger: {
    accent: '#EF4444',
    soft: '#FEF2F2',
    icon: <FiXCircle size={32} />,
    label: 'Error',
  },
};

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [theme, setThemeState] = useState<'candidate' | 'employer' | 'default'>('default');
  const timersRef = useRef<Map<string, number>>(new Map());

  const getVariantStyles = useCallback((variant: NotificationVariant) => {
    const styles = { ...defaultStyles[variant] };
    
    // Override colors based on theme if it's a success or info context
    if (theme === 'employer' && (variant === 'success' || variant === 'info')) {
      styles.accent = '#EA580C'; // Employer Orange
      styles.soft = '#FFF7ED';
    } else if (theme === 'candidate' && (variant === 'success' || variant === 'info')) {
      styles.accent = '#10B981'; // Candidate Green (default, but explicit here)
      styles.soft = '#ECFDF5';
    }
    
    return styles;
  }, [theme]);

  const clearToastTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearToastTimer(id);
  }, [clearToastTimer]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = createId();
      const durationMs = options.durationMs ?? 3500;
      const next: Toast = { ...options, id, durationMs };

      setToasts((prev) => {
        const nextList = [next, ...prev];
        const trimmed = nextList.slice(0, 4);
        const dropped = nextList.slice(4);
        dropped.forEach((t) => clearToastTimer(t.id));
        return trimmed;
      });

      const timer = window.setTimeout(() => removeToast(id), durationMs);
      timersRef.current.set(id, timer);
    },
    [clearToastTimer, removeToast]
  );

  const showModal = useCallback((options: ModalOptions) => {
    setModal({
      ...options,
      open: true,
    });
  }, []);

  const closeModal = useCallback(() => setModal(null), []);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      showModal({
        variant: options.variant ?? 'warning',
        title: options.title,
        message: options.message,
        primaryLabel: options.primaryLabel ?? 'Confirmar',
        secondaryLabel: options.secondaryLabel ?? 'Cancelar',
        onConfirm: () => {
          setModal(null);
          resolve(true);
        },
        onCancel: () => {
          setModal(null);
          resolve(false);
        },
      });
    });
  }, [showModal]);

  const api: NotificationsApi = useMemo(
    () => ({
      toast,
      success: (message, title) => toast({ variant: 'success', title, message }),
      info: (message, title) => toast({ variant: 'info', title, message }),
      warning: (message, title) => toast({ variant: 'warning', title, message }),
      error: (message, title) => showModal({ variant: 'danger', title: title ?? 'Ocurrió un error', message }),
      alert: (message, title) => showModal({ variant: 'warning', title: title ?? 'Atención', message }),
      confirm,
      setTheme: (t) => setThemeState(t),
    }),
    [confirm, showModal, toast]
  );

  return (
    <NotificationsContext.Provider value={api}>
      {children}

      {/* Toasts Container */}
      <div style={{
        position: 'fixed',
        top: 24,
        right: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        zIndex: 30000,
        pointerEvents: 'none'
      }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              pointerEvents: 'auto',
              minWidth: 320,
              maxWidth: 420,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: 20,
              padding: '16px 20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              border: `1px solid ${getVariantStyles(t.variant).soft}`,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              animation: 'toastIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <style>{`
              @keyframes toastIn {
                from { transform: translateX(50px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
              }
              .toast-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: currentColor;
                opacity: 0.3;
                animation: toastProgress linear forwards;
              }
              @keyframes toastProgress {
                from { width: 100%; }
                to { width: 0%; }
              }
            `}</style>
            
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: getVariantStyles(t.variant).soft,
                color: getVariantStyles(t.variant).accent,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0
              }}
            >
              {getVariantStyles(t.variant).icon}
            </div>
            
            <div style={{ flex: 1 }}>
              {t.title && (
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 2 }}>
                  {t.title}
                </div>
              )}
              <div style={{ fontSize: 13, color: '#4B5563', lineHeight: '18px', fontWeight: 500 }}>
                {t.message}
              </div>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: 4,
                display: 'grid',
                placeItems: 'center'
              }}
            >
              <FiX size={16} />
            </button>

            <div 
              className="toast-progress" 
              style={{ 
                color: getVariantStyles(t.variant).accent,
                animationDuration: `${t.durationMs}ms`
              }} 
            />
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal?.open && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 20000,
            animation: 'fadeIn 0.3s ease-out',
          }}
          onClick={() => {
            modal.onCancel?.();
            closeModal();
          }}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scaleIn {
              from { transform: scale(0.9) translateY(10px); opacity: 0; }
              to { transform: scale(1) translateY(0); opacity: 1; }
            }
            .modal-content {
              animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }
          `}</style>
          <div
            className="modal-content"
            style={{
              width: 'min(480px, 100%)',
              background: '#FFFFFF',
              borderRadius: 32,
              padding: '40px 32px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close icon for accessibility */}
            <button
              type="button"
              onClick={() => {
                modal.onCancel?.();
                closeModal();
              }}
              style={{
                position: 'absolute',
                right: 20,
                top: 20,
                width: 36,
                height: 36,
                borderRadius: 12,
                border: 'none',
                background: '#F8FAFC',
                color: '#94A3B8',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F1F5F9';
                e.currentTarget.style.color = '#64748B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F8FAFC';
                e.currentTarget.style.color = '#94A3B8';
              }}
            >
              <FiX size={18} />
            </button>

            {/* Icon Circle */}
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 28,
                background: getVariantStyles(modal.variant).soft,
                color: getVariantStyles(modal.variant).accent,
                display: 'grid',
                placeItems: 'center',
                marginBottom: 24,
                boxShadow: `0 10px 20px ${getVariantStyles(modal.variant).accent}15`,
              }}
            >
              {getVariantStyles(modal.variant).icon}
            </div>

            <h3 style={{ 
              fontSize: 24, 
              fontWeight: 800, 
              color: '#111827', 
              marginBottom: 12,
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}>
              {modal.title || getVariantStyles(modal.variant).label}
            </h3>

            <p style={{ 
              fontSize: 16, 
              color: '#64748B', 
              lineHeight: 1.6,
              marginBottom: 32,
              fontWeight: 500
            }}>
              {modal.message}
            </p>

            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              width: '100%',
              gap: 12 
            }}>
              <button
                type="button"
                onClick={() => {
                  modal.onConfirm?.();
                  closeModal();
                }}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  borderRadius: 16,
                  border: 'none',
                  background: getVariantStyles(modal.variant).accent,
                  color: '#FFFFFF',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: 16,
                  boxShadow: `0 8px 20px -4px ${getVariantStyles(modal.variant).accent}4D`,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 12px 24px -4px ${getVariantStyles(modal.variant).accent}66`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = `0 8px 20px -4px ${getVariantStyles(modal.variant).accent}4D`;
                }}
              >
                {modal.primaryLabel ?? 'Aceptar'}
              </button>

              {modal.secondaryLabel && (
                <button
                  type="button"
                  onClick={() => {
                    modal.onCancel?.();
                    closeModal();
                  }}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    borderRadius: 16,
                    border: '1px solid #E2E8F0',
                    background: '#FFFFFF',
                    color: '#64748B',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 15,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#CBD5E1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  {modal.secondaryLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsApi {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return ctx;
}
