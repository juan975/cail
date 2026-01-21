import { useState } from 'react';
import { LoadingSplash } from '../../components/ui/LoadingSplash';
import { useNotifications } from '../../components/ui/Notifications';
import { UserRole } from '../../types';
import { authService } from '../../services/auth.service';
import { userService } from '../../services/user.service';

interface LoginFormProps {
  role: UserRole;
  onSuccess: (data: any) => void;
  onBack: () => void;
  onSwitchToRegister: () => void;
}

export function LoginForm({ role, onSuccess, onBack, onSwitchToRegister }: LoginFormProps) {
  const notifications = useNotifications();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [splashSuccess, setSplashSuccess] = useState(false);
  const [splashError, setSplashError] = useState(false);
  const [splashErrorMessage, setSplashErrorMessage] = useState('');
  const [pendingData, setPendingData] = useState<any>(null);

  const handleSubmit = async () => {
    if (!email || !password) {
      notifications.alert('Ingresa tu correo y contraseña.', 'Campos incompletos');
      return;
    }

    setLoading(true);
    setShowSplash(true);
    setSplashError(false);
    setSplashSuccess(false);

    try {
      const response = await authService.login(email, password);
      const backendRole = response.tipoUsuario === 'POSTULANTE' ? 'candidate' : 'employer';

      if (backendRole !== role) {
        setSplashErrorMessage('Credenciales inválidas');
        setSplashError(true);
        return;
      }

      let userData: any;
      try {
        const profile = await userService.getProfile();
        userData =
          role === 'candidate'
            ? {
                id: response.idCuenta,
                name: profile.nombreCompleto || response.nombreCompleto,
                email: profile.email || response.email,
                progress: 0.5,
              }
            : {
                id: response.idCuenta,
                company: profile.employerProfile?.nombreEmpresa || 'Empresa',
                contactName: profile.employerProfile?.nombreContacto || response.nombreCompleto,
                email: profile.email || response.email,
                needsPasswordChange: response.needsPasswordChange || false,
                isEmailVerified: true,
              };
      } catch {
        userData =
          role === 'candidate'
            ? {
                id: response.idCuenta,
                name: response.nombreCompleto,
                email: response.email,
                progress: 0.5,
              }
            : {
                id: response.idCuenta,
                company: 'Empresa',
                contactName: response.nombreCompleto,
                email: response.email,
                needsPasswordChange: response.needsPasswordChange || false,
                isEmailVerified: true,
              };
      }

      setPendingData(userData);
      setSplashSuccess(true);
    } catch (error: any) {
      setSplashErrorMessage('Credenciales inválidas');
      setSplashError(true);
    }
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
    setSplashSuccess(false);
    setLoading(false);
    if (pendingData) {
      onSuccess(pendingData);
    }
  };

  const handleSplashErrorComplete = () => {
    setShowSplash(false);
    setSplashError(false);
    setSplashErrorMessage('');
    setLoading(false);
  };

  const accentColor = role === 'candidate' ? '#10B981' : '#F59E0B';
  const accentGradient = role === 'candidate' 
    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
    : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';

  return (
    <>
      <LoadingSplash
        visible={showSplash}
        success={splashSuccess}
        error={splashError}
        message={splashError ? splashErrorMessage : 'Validando credenciales'}
        onComplete={splashError ? handleSplashErrorComplete : handleSplashComplete}
      />

      <div style={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative',
      }}>
        {/* Back Button */}
        <button
          onClick={onBack}
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
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#374151">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Main Card */}
        <div style={{
          width: '100%',
          maxWidth: '480px',
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '48px 40px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
        }}>
          {/* Title */}
          <h1 style={{
            fontSize: '32px',
            fontWeight: 800,
            color: '#111827',
            marginBottom: '8px',
            letterSpacing: '-0.5px',
          }}>
            Iniciar sesión
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6B7280',
            marginBottom: '32px',
          }}>
            {role === 'candidate' ? 'Accede como Candidato' : 'Accede como Empleador'}
          </p>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email */}
            <div>
              <label style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px',
                display: 'block',
              }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                style={{
                  width: '100%',
                  padding: '14px 16px',
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
            </div>

            {/* Password */}
            <div>
              <label style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px',
                display: 'block',
              }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
                  onClick={() => setShowPassword(!showPassword)}
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
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <button
              type="button"
              style={{
                border: 'none',
                background: 'transparent',
                color: accentColor,
                fontSize: '14px',
                fontWeight: 600,
                textAlign: 'right',
                cursor: 'pointer',
                padding: '0',
              }}
            >
              ¿Olvidaste tu contraseña?
            </button>

            {/* Submit Button */}
            <button
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
                boxShadow: `0 4px 14px ${accentColor}40`,
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 6px 20px ${accentColor}50`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 4px 14px ${accentColor}40`;
              }}
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '8px 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
              <span style={{ fontSize: '14px', color: '#9CA3AF', fontWeight: 500 }}>
                ¿Nuevo en CAIL?
              </span>
              <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
            </div>

            {/* Register Button */}
            <button
              onClick={onSwitchToRegister}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: `2px solid ${accentColor}`,
                background: 'transparent',
                color: accentColor,
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${accentColor}10`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Crear cuenta nueva
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
