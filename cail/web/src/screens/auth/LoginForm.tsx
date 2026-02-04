import { useState, useRef, useCallback } from 'react';
import { FiArrowLeft, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { LoadingSplash } from '../../components/ui/LoadingSplash';
import { useNotifications } from '../../components/ui/Notifications';
import { UserRole } from '../../types';
import { authService, RoleMismatchError } from '../../services/auth.service';
import { userService } from '../../services/user.service';
import { useEffect } from 'react';
import logo from '../../assets/logo.png';

interface LoginFormProps {
  role: UserRole;
  onSuccess: (data: any) => void;
  onBack: () => void;
  onSwitchToRegister: () => void;
  onLoginStart?: () => void;
  onLoginEnd?: () => void;
}

export function LoginForm({ role, onSuccess, onBack, onSwitchToRegister, onLoginStart, onLoginEnd }: LoginFormProps) {
  const notifications = useNotifications();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [splashSuccess, setSplashSuccess] = useState(false);
  const [splashError, setSplashError] = useState(false);
  const [splashErrorMessage, setSplashErrorMessage] = useState('');
  const pendingDataRef = useRef<any>(null);

  useEffect(() => {
    document.title = `CAIL | Iniciar Sesión - ${role === 'candidate' ? 'Candidato' : 'Empleador'}`;
  }, [role]);

  const handleSubmit = async () => {
    if (!email || !password) {
      notifications.alert('Ingresa tu correo y contraseña.', 'Campos incompletos');
      return;
    }

    // Notificar a App.tsx que estamos iniciando login 
    // para que ignore onAuthStateChanged durante el proceso
    onLoginStart?.();

    setLoading(true);
    setShowSplash(true);
    setSplashError(false);
    setSplashSuccess(false);

    try {
      // El servicio valida el rol y cierra sesión si no coincide
      const response = await authService.login(email, password, role);

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
      } catch (profileError: any) {
        // CRITICAL: If getProfile returns 403 (unauthorized), we MUST throw this error
        // This handles the case where recruiters are not yet verified by supervisor
        if (profileError?.response?.status === 403 || profileError?.status === 403) {
          console.error('🚫 Profile access denied (403):', profileError?.response?.data?.message || profileError?.message);
          throw profileError; // Re-throw to outer catch block to show error to user
        }

        // For other errors (network issues, etc.), use fallback data
        console.warn('⚠️ Profile fetch failed with non-403 error, using fallback:', profileError);
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

      console.log('✅ [LoginForm] User Data Ready:', userData);
      pendingDataRef.current = userData;
      setSplashSuccess(true);
    } catch (error: any) {
      // Si falla, resetear flags inmediatamente para permitir reintento si no es splash
      setLoading(false); 

      if (error instanceof RoleMismatchError) {
        setSplashErrorMessage(error.message);
      } else {
        // Traducir error técnico a lenguaje natural
        const technicalMessage = error?.message || error?.code || '';
        const friendlyMessage = translateAuthError(technicalMessage);

        // Log para depuración interna (opcional)
        console.warn('❌ Auth Error:', technicalMessage);

        setSplashErrorMessage(friendlyMessage);
      }
      setSplashError(true);
    } finally {
      // No reseteamos loading aquí si hubo éxito, 
      // porque el handleSplashComplete se encarga de eso al redirigir
      if (splashError) {
        setLoading(false);
      }
    }
  };

  // Función auxiliar para traducir errores
  const translateAuthError = (errorMessage: string): string => {
    const lowerMsg = errorMessage.toLowerCase();

    if (lowerMsg.includes('auth/invalid-credential') || lowerMsg.includes('invalid-credential')) {
      return 'Credenciales incorrectas. Verifica tu correo y contraseña.';
    }
    if (lowerMsg.includes('auth/user-not-found') || lowerMsg.includes('user-not-found')) {
      return 'No encontramos una cuenta con este correo.';
    }
    if (lowerMsg.includes('auth/wrong-password') || lowerMsg.includes('wrong-password')) {
      return 'La contraseña es incorrecta.';
    }
    if (lowerMsg.includes('auth/too-many-requests')) {
      return 'Demasiados intentos fallidos. Intenta más tarde.';
    }
    if (lowerMsg.includes('auth/user-disabled')) {
      return 'Esta cuenta ha sido deshabilitada.';
    }
    if (lowerMsg.includes('auth/email-already-in-use')) {
      return 'Este correo ya está registrado.';
    }
    if (lowerMsg.includes('network-request-failed')) {
      return 'Error de conexión. Verifica tu internet.';
    }

    // Fallback genérico pero amigable
    return 'Ocurrió un problema al iniciar sesión. Intenta nuevamente.';
  };

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    setSplashSuccess(false);
    setLoading(false);
    const data = pendingDataRef.current;
    console.log('🌊 [LoginForm] Validating Splash Complete. PendingData:', data);
    if (data) {
      console.log('🚀 [LoginForm] Triggering onSuccess');
      onSuccess(data);
    } else {
      console.error('❌ [LoginForm] Splash completed but NO pendingData!');
    }
  }, [onSuccess]);

  const handleSplashErrorComplete = useCallback(() => {
    setShowSplash(false);
    setSplashError(false);
    setSplashErrorMessage('');
    setLoading(false);
    onLoginEnd?.();
  }, [onLoginEnd]);

  const roleColor = role === 'candidate' ? '#10B981' : '#F59E0B';
  const roleGradient = role === 'candidate'
    ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
    : 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)';

  return (
    <div style={{ ...screenContainerStyle, background: roleGradient }}>
      <LoadingSplash
        visible={showSplash}
        success={splashSuccess}
        error={splashError}
        message={splashError ? (splashErrorMessage || 'Error al iniciar sesión') : splashSuccess ? 'Autenticación exitosa' : 'Validando credenciales...'}
        onComplete={splashError ? handleSplashErrorComplete : handleSplashComplete}
      />

      {/* Header with Back Button */}
      <div style={formHeaderStyle}>
        <button onClick={onBack} style={backButtonStyle}>
          <FiArrowLeft size={28} color="#FFFFFF" />
        </button>
      </div>

      {/* Glass Form Card */}
      <div style={glassCardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '44px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={formLogoContainerStyle}>
            <img src={logo} alt="Logo" style={{ width: '100%', height: 'auto' }} />
          </div>
          <h2 style={loginTitleStyle}>Bienvenido</h2>
          <p style={loginSubtitleStyle}>
            Portal de {role === 'candidate' ? 'Candidatos' : 'Empleadores'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div>
            <label style={labelStyle}>Correo electrónico</label>
            <div style={{ position: 'relative' }}>
              <div style={iconContainerStyle}><FiMail size={18} /></div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                style={inputStyle}
                onFocus={(e) => handleInputFocus(e, roleColor)}
                onBlur={handleInputBlur}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Contraseña</label>
              {/* Optional: Add forgot password link here if needed */}
            </div>
            <div style={{ position: 'relative' }}>
              <div style={iconContainerStyle}><FiLock size={18} /></div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingRight: '52px' }}
                onFocus={(e) => handleInputFocus(e, roleColor)}
                onBlur={handleInputBlur}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={eyeButtonStyle}
              >
                {showPassword ? <FiEyeOff size={22} color="#94A3B8" /> : <FiEye size={22} color="#94A3B8" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              ...submitButtonStyle,
              background: roleColor,
              boxShadow: `0 12px 24px ${roleColor}35`,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 18px 30px ${roleColor}45`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 12px 24px ${roleColor}35`;
            }}
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>

          <div style={footerTextStyle}>
            ¿Aún no tienes cuenta?{' '}
            <button
              onClick={onSwitchToRegister}
              style={{
                background: 'transparent',
                border: 'none',
                color: roleColor,
                fontWeight: 800,
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '16px',
              }}
            >
              Regístrate aquí
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Redesigned Styles
const screenContainerStyle: React.CSSProperties = {
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px',
  position: 'relative',
  transition: 'background 0.5s ease',
};

const formHeaderStyle: React.CSSProperties = {
  position: 'absolute',
  top: '40px',
  left: '40px',
  zIndex: 10,
};

const backButtonStyle: React.CSSProperties = {
  width: '60px',
  height: '60px',
  borderRadius: '20px',
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
};

const glassCardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '520px',
  background: 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(20px)',
  borderRadius: '40px',
  padding: '64px 56px',
  boxShadow: '0 50px 100px rgba(0,0,0,0.18)',
  zIndex: 5,
};

const loginTitleStyle: React.CSSProperties = {
  fontSize: '42px',
  fontWeight: 900,
  color: '#0F172A',
  marginBottom: '12px',
  letterSpacing: '-0.04em',
};

const loginSubtitleStyle: React.CSSProperties = {
  fontSize: '18px',
  color: '#64748B',
  fontWeight: 600,
};

const labelStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 800,
  color: '#334155',
  marginBottom: '10px',
  display: 'block',
  marginLeft: '4px'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '18px 18px 18px 52px',
  fontSize: '17px',
  color: '#0F172A',
  background: '#F1F5F9',
  border: '2px solid transparent',
  borderRadius: '18px',
  outline: 'none',
  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  boxSizing: 'border-box',
  fontWeight: 500,
};

const iconContainerStyle: React.CSSProperties = {
  position: 'absolute',
  left: '18px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#94A3B8',
  display: 'flex',
  alignItems: 'center',
  zIndex: 1,
};

const eyeButtonStyle: React.CSSProperties = {
  position: 'absolute',
  right: '16px',
  top: '50%',
  transform: 'translateY(-50%)',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  zIndex: 1,
};

const submitButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '20px',
  borderRadius: '20px',
  border: 'none',
  color: '#FFFFFF',
  fontSize: '19px',
  fontWeight: 900,
  cursor: 'pointer',
  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  marginTop: '16px',
};

const footerTextStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#64748B',
  fontSize: '16px',
  fontWeight: 600,
  marginTop: '8px'
};

function handleInputFocus(e: React.FocusEvent<HTMLInputElement>, color: string) {
  e.target.style.borderColor = `${color}40`;
  e.target.style.background = '#FFFFFF';
  e.target.style.boxShadow = `0 0 0 5px ${color}10`;
}

function handleInputBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = 'transparent';
  e.target.style.background = '#F1F5F9';
  e.target.style.boxShadow = 'none';
}

const formLogoContainerStyle: React.CSSProperties = {
  width: '64px',
  height: '64px',
  background: '#FFFFFF',
  borderRadius: '16px',
  padding: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '20px',
};
