import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import { LoadingSplash } from '../../components/ui/LoadingSplash';
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
      window.alert('Ingresa tu correo y contraseña.');
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

  const accentColor = role === 'candidate' ? '#1A936F' : '#F1842D';
  const accentLight = role === 'candidate' ? '#E1F4EB' : '#FFE6D6';

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        maxWidth: '460px',
        margin: '0 auto',
      }}
    >
      <LoadingSplash
        visible={showSplash}
        success={splashSuccess}
        error={splashError}
        message={splashError ? splashErrorMessage : 'Validando credenciales'}
        onComplete={splashError ? handleSplashErrorComplete : handleSplashComplete}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            background: '#F9FAFB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#6B7280">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '12px',
            background: '#F9FAFB',
            border: '1px solid #E5E7EB',
            fontSize: '12px',
            fontWeight: 600,
            color: accentColor,
          }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          Acceso seguro
        </div>
      </div>

      {/* Icon Circle */}
      <div
        style={{
          width: '88px',
          height: '88px',
          borderRadius: '44px',
          background: accentLight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '32px',
            background: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#FFFFFF">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                role === 'candidate'
                  ? 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                  : 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
              }
            />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h2
        style={{
          fontSize: '26px',
          fontWeight: 700,
          color: '#1F2937',
          marginBottom: '6px',
          textAlign: 'center',
        }}
      >
        Bienvenido de nuevo
      </h2>
      <p
        style={{
          fontSize: '14px',
          color: '#6B7280',
          marginBottom: '28px',
          textAlign: 'center',
        }}
      >
        {role === 'candidate' ? 'Accede como Candidato' : 'Accede como Empleador'}
      </p>

      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Email */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '8px',
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#6B7280">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
              Correo electrónico
            </label>
          </div>
          <InputField
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={role === 'candidate' ? 'tu@email.com' : 'empresa@dominio.com'}
            type="email"
          />
        </div>

        {/* Password */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '8px',
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#6B7280">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
              Contraseña
            </label>
          </div>
          <div style={{ position: 'relative' }}>
            <InputField
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              type={showPassword ? 'text' : 'password'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '12px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: '8px',
              }}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF">
                {showPassword ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
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
            cursor: 'pointer',
            textAlign: 'right',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '6px',
          }}
        >
          ¿Olvidaste tu contraseña?
        </button>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            background: accentColor,
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          {loading ? 'Ingresando...' : 'Iniciar sesión'}
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
          <span style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: 500 }}>
            ¿Nuevo en CAIL?
          </span>
          <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
        </div>

        {/* Register Button */}
        <button
          onClick={onSwitchToRegister}
          style={{
            padding: '14px',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            background: '#F9FAFB',
            color: accentColor,
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
          Crear cuenta nueva
        </button>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          marginTop: '20px',
        }}
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="rgba(0,0,0,0.4)">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <p style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center', margin: 0 }}>
          Al continuar, aceptas los términos y condiciones de uso
        </p>
      </div>
    </div>
  );
}
