import { useState } from 'react';
import { AuthScreen } from './screens/auth/AuthScreen';
import { ChangePasswordScreen } from './screens/auth/ChangePasswordScreen';
import { CandidateShell } from './screens/candidate/CandidateShell';
import { EmployerShell } from './screens/employer/EmployerShell';
import { TermsScreen } from './screens/legal/TermsScreen';
import { CandidateUserData, EmployerUserData, UserRole, UserSession } from './types';

export default function App() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [showTerms, setShowTerms] = useState(false);

  const handleAuthSuccess = (role: UserRole, userData: any) => {
    setSession({
      role,
      userData,
      needsPasswordChange: role === 'employer' ? userData?.needsPasswordChange ?? false : false,
      isEmailVerified: userData?.isEmailVerified ?? true,
    });
  };

  const handleLogout = () => {
    setSession(null);
  };

  const handlePasswordChanged = () => {
    if (session) {
      setSession({ ...session, needsPasswordChange: false });
    }
  };

  if (showTerms) {
    return <TermsScreen onClose={() => setShowTerms(false)} />;
  }

  if (!session) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} onShowTerms={() => setShowTerms(true)} />;
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
