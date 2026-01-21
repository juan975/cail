import { useState } from 'react';
import { FiEye, FiEyeOff, FiLogOut, FiShield } from 'react-icons/fi';
import { LoadingSplash } from '../../components/ui/LoadingSplash';
import { useNotifications } from '../../components/ui/Notifications';
import { PasswordStrength, validatePassword } from '../../components/ui/PasswordStrength';
import { authService } from '../../services/auth.service';
import { EmployerUserData } from '../../types';

interface ChangePasswordScreenProps {
  userData: EmployerUserData & { showWelcomeModal?: boolean };
  onPasswordChanged: () => void;
  onLogout: () => void;
}

export function ChangePasswordScreen({ userData, onPasswordChanged, onLogout }: ChangePasswordScreenProps) {
  const notifications = useNotifications();
  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [splashSuccess, setSplashSuccess] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(!!userData?.showWelcomeModal);

  const handleSubmit = async () => {
    if (!tempPassword) {
      notifications.alert('Ingresa tu contraseña temporal.', 'Campo requerido');
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      notifications.alert(validation.errors[0], 'Contraseña inválida');
      return;
    }

    if (newPassword !== confirmPassword) {
      notifications.alert('Las contraseñas no coinciden.', 'Validación');
      return;
    }

    setLoading(true);
    setShowSplash(true);

    try {
      await authService.changePassword(tempPassword, newPassword, userData.email);
      setSplashSuccess(true);
    } catch (error: any) {
      setShowSplash(false);
      setLoading(false);
      notifications.error(error.message || 'No se pudo cambiar la contraseña');
    }
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
    setSplashSuccess(false);
    setLoading(false);
    onPasswordChanged();
  };

  const accentColor = '#F59E0B';
  const accentGradient = 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';

  return (
    <>
      <LoadingSplash visible={showSplash} success={splashSuccess} onComplete={handleSplashComplete} />

      <div
        style={{
          minHeight: '100vh',
          width: '100%',
          background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          position: 'relative',
        }}
      >
        {/* Logout Button */}
        <button
          onClick={onLogout}
          style={{
            position: 'absolute',
            top: '32px',
            left: '32px',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            border: 'none',
            background: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            e.currentTarget.style.transform = 'translateX(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <FiLogOut size={22} color="#374151" />
        </button>

        {/* Main Card */}
        <div
          style={{
            width: '100%',
            maxWidth: '520px',
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '48px 40px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: '#FFF7ED',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <FiShield size={22} color={accentColor} />
            </div>
            <div style={{ flex: 1 }}>
              <h1
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  color: '#111827',
                  margin: 0,
                  letterSpacing: '-0.5px',
                }}
              >
                Actualiza tu contraseña
              </h1>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: '6px 0 0 0' }}>
                {userData.company} • {userData.contactName}
              </p>
            </div>
          </div>

          <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '28px' }}>
            Por seguridad, debes cambiar la contraseña temporal para continuar.
          </p>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px',
                  display: 'block',
                }}
              >
                Contraseña temporal
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showTempPassword ? 'text' : 'password'}
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  placeholder="Ingresa la contraseña enviada por correo"
                  style={{
                    width: '100%',
                    padding: '14px 50px 14px 16px',
                    fontSize: '16px',
                    color: '#111827',
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = accentColor;
                    e.target.style.background = '#FFFFFF';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.background = '#F9FAFB';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowTempPassword(!showTempPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  aria-label={showTempPassword ? 'Ocultar contraseña temporal' : 'Mostrar contraseña temporal'}
                >
                  {showTempPassword ? <FiEyeOff size={20} color="#9CA3AF" /> : <FiEye size={20} color="#9CA3AF" />}
                </button>
              </div>
            </div>

            <div>
              <label
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px',
                  display: 'block',
                }}
              >
                Nueva contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 12 caracteres"
                  style={{
                    width: '100%',
                    padding: '14px 50px 14px 16px',
                    fontSize: '16px',
                    color: '#111827',
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = accentColor;
                    e.target.style.background = '#FFFFFF';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.background = '#F9FAFB';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  aria-label={showNewPassword ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'}
                >
                  {showNewPassword ? <FiEyeOff size={20} color="#9CA3AF" /> : <FiEye size={20} color="#9CA3AF" />}
                </button>
              </div>
              <div style={{ marginTop: 10 }}>
                <PasswordStrength password={newPassword} variant="employer" />
              </div>
            </div>

            <div>
              <label
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px',
                  display: 'block',
                }}
              >
                Confirmar contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu nueva contraseña"
                  style={{
                    width: '100%',
                    padding: '14px 50px 14px 16px',
                    fontSize: '16px',
                    color: '#111827',
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = accentColor;
                    e.target.style.background = '#FFFFFF';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.background = '#F9FAFB';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                >
                  {showConfirmPassword ? <FiEyeOff size={20} color="#9CA3AF" /> : <FiEye size={20} color="#9CA3AF" />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                background: accentGradient,
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '6px',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.45)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(245, 158, 11, 0.35)';
              }}
            >
              {loading ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '14px', color: '#6B7280' }}>
              ¿Necesitas salir?{' '}
              <button
                type="button"
                onClick={onLogout}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#EF4444',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: 0,
                }}
              >
                <FiLogOut /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {showWelcomeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 40,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 24,
              padding: 28,
              width: 'min(440px, 92%)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            }}
          >
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#111827' }}>Bienvenido</h3>
            <div style={{ fontSize: 14, color: '#6B7280', marginTop: 10, lineHeight: '20px' }}>
              Tu cuenta fue creada exitosamente. Cambia la contraseña temporal para continuar.
            </div>
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <button
                type="button"
                onClick={() => setShowWelcomeModal(false)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: 'none',
                  background: accentGradient,
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
