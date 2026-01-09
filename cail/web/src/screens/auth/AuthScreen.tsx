import { useState } from 'react';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import { UserRole } from '../../types';
import { LoginForm } from './LoginForm';
import { RegisterCandidateForm } from './RegisterCandidateForm';
import { RegisterEmployerForm } from './RegisterEmployerForm';
import logo from '../../assets/logo.png';

type AuthMode = 'select' | 'login' | 'register';

interface AuthScreenProps {
  onAuthSuccess: (role: UserRole, data: any) => void;
  onShowTerms: () => void;
}

export function AuthScreen({ onAuthSuccess, onShowTerms }: AuthScreenProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('candidate');
  const [mode, setMode] = useState<AuthMode>('select');

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setMode('login');
  };

  const handleSuccess = (data: any) => {
    onAuthSuccess(selectedRole, data);
  };

  const content = (
    <div className="auth-container">
      {/* Hero Section */}
      {mode === 'select' && (
        <div className="hero-section">
          <div className="logo-badge">
            <img src={logo} alt="CAIL" />
          </div>

          <div className="hero-pill">
            <svg fill="none" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="hero-pill-text">CAIL</span>
          </div>

          <h1 className="headline">Bolsa de Empleo</h1>
          <p className="subtitle">Cámara de Industrias de Loja</p>
        </div>
      )}

      {/* Role Cards */}
      {mode === 'select' ? (
        <>
          <div className="role-cards">
            <div className="role-card" onClick={() => handleRoleSelect('candidate')}>
              <div className="role-icon" style={{ backgroundColor: '#1A936F' }}>
                <svg fill="none" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="role-content">
                <h3 className="role-title">Soy Candidato</h3>
                <p className="role-description">Busco oportunidades laborales</p>
              </div>
              <div className="role-arrow">
                <span className="role-arrow-text" style={{ color: '#1A936F' }}>
                  Continuar
                </span>
                <svg fill="none" viewBox="0 0 24 24" stroke="#1A936F">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            <div className="role-card" onClick={() => handleRoleSelect('employer')}>
              <div className="role-icon" style={{ backgroundColor: '#F1842D' }}>
                <svg fill="none" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="role-content">
                <h3 className="role-title">Soy Empleador</h3>
                <p className="role-description">Busco talento para mi empresa</p>
              </div>
              <div className="role-arrow">
                <span className="role-arrow-text" style={{ color: '#F1842D' }}>
                  Continuar
                </span>
                <svg fill="none" viewBox="0 0 24 24" stroke="#F1842D">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="footer">
            <svg fill="none" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span className="footer-text">Conectando talento con oportunidades en Loja</span>
          </div>
        </>
      ) : (
        <div className="form-card">
          {mode === 'login' && (
            <LoginForm
              role={selectedRole}
              onSuccess={handleSuccess}
              onBack={() => setMode('select')}
              onSwitchToRegister={() => setMode('register')}
            />
          )}
          {mode === 'register' && selectedRole === 'candidate' && (
            <RegisterCandidateForm
              onSuccess={handleSuccess}
              onBack={() => setMode('select')}
              onSwitchToLogin={() => setMode('login')}
            />
          )}
          {mode === 'register' && selectedRole === 'employer' && (
            <RegisterEmployerForm
              onSuccess={handleSuccess}
              onBack={() => setMode('select')}
              onSwitchToLogin={() => setMode('login')}
            />
          )}
        </div>
      )}

      <div className="legal-container">
        <button
          onClick={onShowTerms}
          className={`legal-button ${mode !== 'select' ? 'legal-button-form' : ''}`}
        >
          <svg fill="none" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>Términos y Condiciones</span>
        </button>
      </div>
    </div>
  );

  return mode === 'select' ? (
    <div className="auth-gradient">{content}</div>
  ) : (
    <div className="auth-plain">{content}</div>
  );
}
