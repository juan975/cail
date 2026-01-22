import { useState, useEffect, useRef } from 'react';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { AuthScreen } from './screens/auth/AuthScreen';
import { ChangePasswordScreen } from './screens/auth/ChangePasswordScreen';
import { CandidateShell } from './screens/candidate/CandidateShell';
import { EmployerShell } from './screens/employer/EmployerShell';
import { TermsScreen } from './screens/legal/TermsScreen';
import { CandidateUserData, EmployerUserData, UserRole, UserSession } from './types';
import { firebaseAuthService } from './services/firebase.service';
import { userService } from './services/user.service';
import { apiService } from './services/api.service';
import { authService } from './services/auth.service';

export default function App() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(true);

  // Flag para ignorar la restauración automática durante el proceso de login
  const isLoggingIn = useRef(false);

  // Listener para detectar cambios de autenticación de Firebase
  // IMPORTANTE: No restauramos sesión automáticamente aquí para evitar condiciones de carrera
  // La sesión se establece SOLO a través de handleAuthSuccess después de validar el rol
  useEffect(() => {
    const unsubscribe = firebaseAuthService.onAuthStateChanged(async (user) => {
      // Si estamos en proceso de login, ignorar este callback
      if (isLoggingIn.current) {
        console.log('🔄 Ignoring auth state change during login process');
        return;
      }

      if (user) {
        // Solo restaurar sesión si NO estamos en proceso de login
        // y si ya teníamos una sesión activa (caso de recarga de página)
        if (session === null && !isLoggingIn.current) {
          try {
            const profileResponse = await apiService.get<{ status: string; data: any }>('/auth/profile');
            const profile = profileResponse.data;

            const role: UserRole = profile.tipoUsuario === 'POSTULANTE' ? 'candidate' : 'employer';

            let userData: any;
            if (role === 'candidate') {
              userData = {
                id: user.uid,
                name: profile.nombreCompleto,
                email: user.email || profile.email,
                progress: 0.5,
              };
            } else {
              let fullProfile;
              try {
                fullProfile = await userService.getProfile();
              } catch {
                fullProfile = profile;
              }

              userData = {
                id: user.uid,
                company: fullProfile.employerProfile?.nombreEmpresa || 'Empresa',
                contactName: fullProfile.employerProfile?.nombreContacto || profile.nombreCompleto,
                email: user.email || profile.email,
                needsPasswordChange: profile.needsPasswordChange || false,
                isEmailVerified: true,
              };
            }

            setSession({
              role,
              userData,
              needsPasswordChange: role === 'employer' ? userData?.needsPasswordChange ?? false : false,
              isEmailVerified: userData?.isEmailVerified ?? true,
            });
          } catch (error) {
            console.error('Error restoring session:', error);
            await firebaseAuthService.logout();
            setSession(null);
          }
        }
      } else {
        // No hay usuario autenticado - limpiar sesión
        setSession(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [session]);

  const handleAuthSuccess = (role: UserRole, userData: any) => {
    // Desactivar el flag de login
    isLoggingIn.current = false;

    setSession({
      role,
      userData,
      needsPasswordChange: role === 'employer' ? userData?.needsPasswordChange ?? false : false,
      isEmailVerified: userData?.isEmailVerified ?? true,
    });
  };

  // Función para indicar que comenzó el proceso de login
  const handleLoginStart = () => {
    isLoggingIn.current = true;
  };

  const handleLogout = async () => {
    await authService.logout();
    setSession(null);
  };

  const handlePasswordChanged = () => {
    if (session) {
      setSession({ ...session, needsPasswordChange: false });
    }
  };

  // Mostrar loading mientras se verifica el estado inicial
  if (loading) {
    return (
      <LoadingSpinner 
        fullPage 
        message="CAIL está despegando..." 
        background="linear-gradient(135deg, #10B981 0%, #059669 100%)"
        color="#fff"
      />
    );
  }

  if (showTerms) {
    return <TermsScreen onClose={() => setShowTerms(false)} />;
  }

  if (!session) {
    return (
      <AuthScreen
        onAuthSuccess={handleAuthSuccess}
        onShowTerms={() => setShowTerms(true)}
        onLoginStart={handleLoginStart}
      />
    );
  }

  if (session.role === 'employer' && session.needsPasswordChange) {
    return (
      <ChangePasswordScreen
        userData={session.userData as EmployerUserData}
        onPasswordChanged={handlePasswordChanged}
        onLogout={handleLogout}
      />
    );
  }

  return session.role === 'candidate' ? (
    <CandidateShell userData={session.userData as CandidateUserData} onLogout={handleLogout} />
  ) : (
    <EmployerShell userData={session.userData as EmployerUserData} onLogout={handleLogout} />
  );
}
