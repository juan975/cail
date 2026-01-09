import { useState } from 'react';
import { FiEye, FiEyeOff, FiLogOut, FiShield } from 'react-icons/fi';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import { LoadingSplash } from '../../components/ui/LoadingSplash';
import { PasswordStrength, validatePassword } from '../../components/ui/PasswordStrength';
import { authService } from '../../services/auth.service';
import { EmployerUserData } from '../../types';

interface ChangePasswordScreenProps {
  userData: EmployerUserData & { showWelcomeModal?: boolean };
  onPasswordChanged: () => void;
  onLogout: () => void;
}

export function ChangePasswordScreen({ userData, onPasswordChanged, onLogout }: ChangePasswordScreenProps) {
  const { contentWidth, horizontalGutter } = useResponsiveLayout();
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
      window.alert('Ingresa tu contraseña temporal.');
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      window.alert(validation.errors[0]);
      return;
    }

    if (newPassword !== confirmPassword) {
      window.alert('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    setShowSplash(true);

    try {
      await authService.changePassword(tempPassword, newPassword);
      setSplashSuccess(true);
    } catch (error: any) {
      setShowSplash(false);
      setLoading(false);
      window.alert(error.message || 'No se pudo cambiar la contraseña');
    }
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
    setSplashSuccess(false);
    setLoading(false);
    onPasswordChanged();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)',
        padding: `24px ${horizontalGutter}px`,
      }}
    >
      <LoadingSplash visible={showSplash} success={splashSuccess} onComplete={handleSplashComplete} />

      <div style={{ maxWidth: contentWidth, margin: '0 auto' }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 18px 30px rgba(15, 23, 42, 0.12)',
            display: 'grid',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 14,
                background: '#FFF7ED',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <FiShield size={22} color="#F59E0B" />
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>Cambio de contraseña obligatorio</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>{userData.company}</div>
            </div>
          </div>

          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Contraseña temporal</span>
            <div style={{ position: 'relative' }}>
              <input
                type={showTempPassword ? 'text' : 'password'}
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 14px',
                  borderRadius: 12,
                  border: '1px solid #E5E7EB',
                }}
              />
              <button
                type="button"
                onClick={() => setShowTempPassword(!showTempPassword)}
                style={{ position: 'absolute', right: 12, top: 10, border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                {showTempPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Nueva contraseña</span>
            <div style={{ position: 'relative' }}>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 14px',
                  borderRadius: 12,
                  border: '1px solid #E5E7EB',
                }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{ position: 'absolute', right: 12, top: 10, border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                {showNewPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Confirmar contraseña</span>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 14px',
                  borderRadius: 12,
                  border: '1px solid #E5E7EB',
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: 'absolute', right: 12, top: 10, border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </label>

          <PasswordStrength password={newPassword} variant="employer" />

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onLogout}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 12,
                border: '1px solid #E5E7EB',
                background: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <FiLogOut /> Cerrar sesión
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 12,
                border: 'none',
                background: '#F59E0B',
                color: '#fff',
                cursor: 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
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
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, width: 'min(420px, 90%)' }}>
            <h3 style={{ marginTop: 0 }}>Bienvenido</h3>
            <div style={{ fontSize: 13, color: '#6B7280' }}>
              Tu cuenta fue creada exitosamente. Cambia la contraseña temporal para continuar.
            </div>
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <button
                type="button"
                onClick={() => setShowWelcomeModal(false)}
                style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: '#F59E0B', color: '#fff' }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
