import { useState } from 'react';
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

  // Role selection screen
  if (mode === 'select') {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '900px',
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '60px 40px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
        }}>
          {/* Logo and Title */}
          <div style={{
            textAlign: 'center',
            marginBottom: '48px',
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              margin: '0 auto 24px',
              borderRadius: '20px',
              background: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img src={logo} alt="CAIL" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
            </div>
            <h1 style={{
              fontSize: '36px',
              fontWeight: 800,
              color: '#111827',
              marginBottom: '8px',
              letterSpacing: '-0.5px',
            }}>
              Bolsa de Empleo
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#6B7280',
              fontWeight: 500,
            }}>
              Cámara de Industrias de Loja
            </p>
          </div>

          {/* Role Selection Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '32px',
          }}>
            {/* Candidate Card */}
            <div
              onClick={() => handleRoleSelect('candidate')}
              style={{
                background: '#FFFFFF',
                border: '2px solid #E5E7EB',
                borderRadius: '16px',
                padding: '32px 24px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                textAlign: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#10B981';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.15)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 20px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
              }}>
                <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#FFFFFF">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '8px',
              }}>
                Soy Candidato
              </h3>
              <p style={{
                fontSize: '15px',
                color: '#6B7280',
                lineHeight: '1.6',
              }}>
                Busco oportunidades laborales y quiero conectar con empresas
              </p>
            </div>

            {/* Employer Card */}
            <div
              onClick={() => handleRoleSelect('employer')}
              style={{
                background: '#FFFFFF',
                border: '2px solid #E5E7EB',
                borderRadius: '16px',
                padding: '32px 24px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                textAlign: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#F59E0B';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.15)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 20px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)',
              }}>
                <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#FFFFFF">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#111827',
                marginBottom: '8px',
              }}>
                Soy Empleador
              </h3>
              <p style={{
                fontSize: '15px',
                color: '#6B7280',
                lineHeight: '1.6',
              }}>
                Represento una empresa y busco talento para mi organización
              </p>
            </div>
          </div>

          {/* Footer text */}
          <p style={{
            textAlign: 'center',
            fontSize: '14px',
            color: '#9CA3AF',
          }}>
            Selecciona tu perfil para continuar
          </p>
        </div>
      </div>
    );
  }

  // Login or Register
  if (mode === 'login') {
    return (
      <LoginForm
        role={selectedRole}
        onSuccess={handleSuccess}
        onBack={() => setMode('select')}
        onSwitchToRegister={() => setMode('register')}
      />
    );
  }

  // Register
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
