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
};

type Toast = ToastOptions & { id: string; durationMs: number };

type ModalState = ModalOptions & {
  open: boolean;
};

const NotificationsContext = createContext<NotificationsApi | null>(null);

const variantStyles: Record<
  NotificationVariant,
  { accent: string; soft: string; icon: JSX.Element }
> = {
  success: {
    accent: '#10B981',
    soft: '#ECFDF5',
    icon: <FiCheckCircle size={20} />,
  },
  info: {
    accent: '#3B82F6',
    soft: '#EFF6FF',
    icon: <FiInfo size={20} />,
  },
  warning: {
    accent: '#F59E0B',
    soft: '#FFFBEB',
    icon: <FiAlertTriangle size={20} />,
  },
  danger: {
    accent: '#EF4444',
    soft: '#FEF2F2',
    icon: <FiXCircle size={20} />,
  },
};

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [modal, setModal] = useState<ModalState | null>(null);
  const timersRef = useRef<Map<string, number>>(new Map());

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
    }),
    [confirm, showModal, toast]
  );

  return (
    <NotificationsContext.Provider value={api}>
      {children}

      {/* Toasts removed as per user request */}

      {/* Modal */}
      {modal?.open && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 20000,
          }}
          onClick={() => {
            modal.onCancel?.();
            closeModal();
          }}
        >
          <div
            style={{
              width: 'min(520px, 100%)',
              background: '#FFFFFF',
              borderRadius: 24,
              padding: 24,
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: variantStyles[modal.variant].soft,
                  color: variantStyles[modal.variant].accent,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                {variantStyles[modal.variant].icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginTop: 2 }}>
                  {modal.title}
                </div>
                <div style={{ fontSize: 14, color: '#6B7280', marginTop: 6, lineHeight: '20px' }}>
                  {modal.message}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  modal.onCancel?.();
                  closeModal();
                }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  border: 'none',
                  background: '#F3F4F6',
                  color: '#6B7280',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                }}
                aria-label="Cerrar"
              >
                <FiX size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              {modal.secondaryLabel && (
                <button
                  type="button"
                  onClick={() => {
                    modal.onCancel?.();
                    closeModal();
                  }}
                  style={{
                    padding: '12px 20px',
                    borderRadius: 12,
                    border: '1px solid #E2E8F0',
                    background: '#FFFFFF',
                    color: '#64748B',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  {modal.secondaryLabel}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  modal.onConfirm?.();
                  closeModal();
                }}
                style={{
                  padding: '12px 24px',
                  borderRadius: 12,
                  border: 'none',
                  background: variantStyles[modal.variant].accent,
                  color: '#FFFFFF',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: 14,
                  boxShadow: `0 4px 12px ${variantStyles[modal.variant].accent}33`,
                }}
              >
                {modal.primaryLabel ?? 'Aceptar'}
              </button>
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
