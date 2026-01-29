import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthScreen } from '@/screens/auth/AuthScreen';
import { ChangePasswordScreen } from '@/screens/auth/ChangePasswordScreen';
import { CandidateShell } from '@/screens/candidate/CandidateShell';
import { EmployerShell } from '@/screens/employer/EmployerShell';
import { TermsScreen } from '@/screens/legal/TermsScreen';
import { CandidateUserData, EmployerUserData, UserRole, UserSession } from '@/types';
import { colors } from '@/theme/colors';
import { firebaseAuthService } from '@/services/firebase.service';
import { apiService } from '@/services/api.service';
import { NotificationsProvider } from '@/components/ui/Notifications';

function RootApp() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Flag para ignorar la restauración automática durante el proceso de login
  const isLoggingIn = useRef(false);

  // Escuchar cambios de estado de autenticación de Firebase
  // IMPORTANTE: No restauramos sesión durante el proceso de login
  // para evitar condiciones de carrera con la validación de roles
  useEffect(() => {
    console.log('🔄 Setting up auth state listener...');

    const unsubscribe = firebaseAuthService.onAuthStateChanged(async (user) => {
      // Si estamos en proceso de login, ignorar este callback
      // La validación de roles se hace en LoginForm
      if (isLoggingIn.current) {
        console.log('🔄 Ignoring auth state change during login process');
        setIsLoading(false);
        return;
      }

      if (user) {
        console.log('✅ Firebase user found on load:', user.email);
        try {
          // Obtener y guardar el token de Firebase
          const idToken = await user.getIdToken();
          await apiService.saveToken(idToken);

          // Obtener perfil del backend
          const profileResponse = await apiService.get<{ status: string; data: any }>('/users/profile');
          const profile = profileResponse.data;

          const role: UserRole = profile.tipoUsuario === 'POSTULANTE' ? 'candidate' : 'employer';

          if (role === 'candidate') {
            const candidateData: CandidateUserData = {
              id: user.uid,
              name: profile.nombreCompleto,
              email: user.email || '',
              progress: 0.5,
            };
            setSession({
              role,
              userData: candidateData,
              needsPasswordChange: false,
              isEmailVerified: user.emailVerified ?? true,
            });
          } else {
            const employerData: EmployerUserData = {
              id: user.uid,
              company: profile.employerProfile?.nombreEmpresa || 'Empresa',
              contactName: profile.nombreCompleto,
              email: user.email || '',
              needsPasswordChange: profile.needsPasswordChange || false,
              isEmailVerified: user.emailVerified,
            };
            setSession({
              role,
              userData: employerData,
              needsPasswordChange: profile.needsPasswordChange ?? false,
              isEmailVerified: user.emailVerified ?? true,
            });
          }
          console.log('✅ Session restored for:', user.email, 'as', role);
        } catch (error) {
          console.error('❌ Error restoring session:', error);
          // Si falla el perfil, hacer logout
          await firebaseAuthService.logout();
          setSession(null);
        }
      } else {
        console.log('ℹ️ No Firebase user found');
        setSession(null);
      }
      setIsLoading(false);
    });

    // Cleanup al desmontar
    return () => unsubscribe();
  }, []);

  // Función para indicar que comenzó el proceso de login
  const handleLoginStart = () => {
    isLoggingIn.current = true;
  };

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.candidate} />
      </View>
    );
  }

  const handleAuthSuccess = (role: UserRole, userData: any) => {
    // Resetear el flag de login
    isLoggingIn.current = false;

    setSession({
      role,
      userData,
      needsPasswordChange: role === 'employer' ? userData?.needsPasswordChange ?? false : false,
      isEmailVerified: userData?.isEmailVerified ?? true,
    });
  };

  const handleLogout = async () => {
    try {
      await firebaseAuthService.logout();
      console.log('✅ Logged out successfully');
    } catch (error) {
      console.error('❌ Error during logout:', error);
    }
    setSession(null);
  };

  const handlePasswordChanged = () => {
    if (session) {
      setSession({ ...session, needsPasswordChange: false });
    }
  };

  const handleShowTerms = () => setShowTerms(true);
  const handleCloseTerms = () => setShowTerms(false);

  if (showTerms) {
    return <TermsScreen onClose={handleCloseTerms} />;
  }

  if (!session) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} onShowTerms={handleShowTerms} onLoginStart={handleLoginStart} />;
  }

  if (session.role === 'employer' && session.needsPasswordChange) {
    return (
      <ChangePasswordScreen
        userData={session.userData}
        onPasswordChanged={handlePasswordChanged}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <View style={styles.appBackground}>
      {session.role === 'candidate' ? (
        <CandidateShell userData={session.userData as CandidateUserData} onLogout={handleLogout} />
      ) : (
        <EmployerShell userData={session.userData as EmployerUserData} onLogout={handleLogout} />
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NotificationsProvider>
        <StatusBar style="light" />
        <RootApp />
      </NotificationsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appBackground: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
