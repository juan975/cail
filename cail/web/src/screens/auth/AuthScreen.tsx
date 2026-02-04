import { FiUser, FiBriefcase, FiArrowRight } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { UserRole } from '../../types';
import { LoginForm } from './LoginForm';
import { RegisterCandidateForm } from './RegisterCandidateForm';
import { RegisterEmployerForm } from './RegisterEmployerForm';
import logo from '../../assets/logo.png';

type AuthMode = 'select' | 'login' | 'register';

interface AuthScreenProps {
  onAuthSuccess: (role: UserRole, data: any) => void;
  onShowTerms: () => void;
  onLoginStart?: () => void;
  onLoginEnd?: () => void;
}

export function AuthScreen({ onAuthSuccess, onShowTerms, onLoginStart, onLoginEnd }: AuthScreenProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('candidate');
  const [mode, setMode] = useState<AuthMode>('select');

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setMode('login');
  };

  useEffect(() => {
    document.title = 'CAIL | Iniciar Sesión';
  }, []);

  const handleSuccess = (data: any) => {
    onAuthSuccess(selectedRole, data);
  };

  if (mode === 'select') {
    return (
      <div style={containerStyle} className="auth-screen-container">
        {/* Logo and Title Overlay */}
        <div style={headerOverlayStyle}>
          <div style={logoCardStyle}>
            <img 
              src={logo} 
              alt="Logo CAIL" 
              style={{ width: '100%', height: 'auto' }} 
            />
          </div>
          <h1 style={titleStyle}>Bolsa de Empleo</h1>
          <p style={subtitleStyle}>Cámara de Industrias de Loja</p>
        </div>

        {/* Split Section */}
        <div style={splitSectionStyle} className="split-section">
          {/* Candidate Side */}
          <div style={{ ...halfStyle, background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)' }}>
            <div style={contentWrapperStyle}>
              <div style={glassIconCardStyle}>
                <FiUser size={40} color="#FFFFFF" />
              </div>
              <h2 style={cardTitleStyle}>Soy Candidato</h2>
              <p style={cardDescStyle}>
                Busco trabajo y quiero conectar con nuevas oportunidades
              </p>
              <button 
                onClick={() => handleRoleSelect('candidate')}
                style={selectButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Seleccionar
              </button>
            </div>
          </div>

          {/* Employer Side */}
          <div style={{ ...halfStyle, background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)' }}>
            <div style={contentWrapperStyle}>
              <div style={glassIconCardStyle}>
                <FiBriefcase size={40} color="#FFFFFF" />
              </div>
              <h2 style={cardTitleStyle}>Soy Empleador</h2>
              <p style={cardDescStyle}>
                Represento una empresa y busco talento para mi organización
              </p>
              <button 
                onClick={() => handleRoleSelect('employer')}
                style={selectButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Seleccionar
              </button>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .split-section { flex-direction: column; overflow-y: auto; }
            .auth-screen-container { height: auto; min-height: 100vh; }
          }
        `}</style>
      </div>
    );
  }

  if (mode === 'login') {
    return (
      <LoginForm
        role={selectedRole}
        onSuccess={handleSuccess}
        onBack={() => setMode('select')}
        onSwitchToRegister={() => setMode('register')}
        onLoginStart={onLoginStart}
        onLoginEnd={onLoginEnd}
      />
    );
  }

  if (selectedRole === 'candidate') {
    return (
      <RegisterCandidateForm
        onSuccess={handleSuccess}
        onBack={() => setMode('login')}
        onSwitchToLogin={() => setMode('login')}
      />
    );
  }

  return (
    <RegisterEmployerForm
      onSuccess={handleSuccess}
      onBack={() => setMode('login')}
      onSwitchToLogin={() => setMode('login')}
    />
  );
}

// Styles
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  width: '100%',
  overflow: 'hidden',
  position: 'relative',
};

const headerOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: '60px',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  zIndex: 10,
};

const logoCardStyle: React.CSSProperties = {
  width: '100px',
  height: '100px',
  background: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '24px',
  padding: '20px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  backdropFilter: 'blur(10px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '20px',
};

const titleStyle: React.CSSProperties = {
  fontSize: '42px',
  fontWeight: 900,
  color: '#FFFFFF',
  marginBottom: '8px',
  letterSpacing: '-0.03em',
  textShadow: '0 2px 10px rgba(0,0,0,0.2)',
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '19px',
  color: 'rgba(255, 255, 255, 0.95)',
  fontWeight: 600,
  letterSpacing: '0.01em',
  textShadow: '0 1px 5px rgba(0,0,0,0.15)',
};

const splitSectionStyle: React.CSSProperties = {
  flex: '1',
  display: 'flex',
  width: '100%',
  height: '100%',
};

const halfStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px',
  textAlign: 'center',
  position: 'relative',
  transition: 'all 0.4s ease',
};

const contentWrapperStyle: React.CSSProperties = {
  maxWidth: '380px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const glassIconCardStyle: React.CSSProperties = {
  width: '88px',
  height: '88px',
  borderRadius: '24px',
  background: 'rgba(255, 255, 255, 0.18)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.25)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '28px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: '36px',
  fontWeight: 800,
  color: '#FFFFFF',
  marginBottom: '16px',
  letterSpacing: '-0.02em',
};

const cardDescStyle: React.CSSProperties = {
  fontSize: '17px',
  color: 'rgba(255, 255, 255, 0.95)',
  marginBottom: '40px',
  lineHeight: 1.65,
  fontWeight: 500,
};

const selectButtonStyle: React.CSSProperties = {
  padding: '16px 56px',
  borderRadius: '999px',
  background: '#FFFFFF',
  color: '#0F172A',
  fontSize: '17px',
  fontWeight: 700,
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
};
