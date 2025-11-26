import { useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, gradients } from '@/theme/colors';
import { useResponsiveLayout } from '@/hooks/useResponsive';
import { UserRole } from '@/types';
import { LoginForm } from './LoginForm';
import { RegisterCandidateForm } from './RegisterCandidateForm';
import { RegisterEmployerForm } from './RegisterEmployerForm';

const logo = require('@/assets/logo.png');

type AuthMode = 'select' | 'login' | 'register';

type AuthScreenProps = {
  onAuthSuccess: (role: UserRole, data: any) => void;
};

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const { isTablet, isDesktop, contentWidth, horizontalGutter } = useResponsiveLayout();
  const [selectedRole, setSelectedRole] = useState<UserRole>('candidate');
  const [mode, setMode] = useState<AuthMode>('select');

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setMode('login');
  };

  const handleSuccess = (data: any) => {
    onAuthSuccess(selectedRole, data);
  };

  return (
    <LinearGradient colors={['#0F8154', '#0F8154', '#1A5F7A']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalGutter }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.inner, { maxWidth: contentWidth }]}>
            {mode === 'select' && (
              <View style={styles.logoWrapper}>
                <View style={styles.logoBadge}>
                  <Image source={logo} style={styles.logo} resizeMode="contain" />
                </View>
                <Text style={styles.headline}>Bolsa de Empleo CAIL</Text>
                <Text style={styles.subtitle}>Cámara de Industrias de Loja</Text>
                <Text style={styles.tagline}>Gestión de Perfiles - Acceso al sistema</Text>
              </View>
            )}

            {mode === 'select' ? (
              <View style={[styles.options, (isTablet || isDesktop) && styles.optionsWide]}>
                <RoleButton
                  title="Soy Candidato"
                  description="Busco empleo"
                  icon="user"
                  onPress={() => handleRoleSelect('candidate')}
                />
                <RoleButton
                  title="Soy Empleador"
                  description="Busco personal"
                  icon="briefcase"
                  accent="employer"
                  onPress={() => handleRoleSelect('employer')}
                />
                <Text style={styles.footerText}>Conectando talento con oportunidades en Loja</Text>
              </View>
            ) : (
              <Card
                tone="accent"
                spacing="lg"
                style={[styles.formCard, (isTablet || isDesktop) && styles.formCardWide]}
              >
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
              </Card>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function RoleButton({
  title,
  description,
  icon,
  onPress,
  accent = 'candidate',
}: {
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  accent?: 'candidate' | 'employer';
}) {
  const iconBgColor = accent === 'candidate' ? '#0F8154' : '#F59E0B';
  
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.roleCard}>
        <View style={[styles.roleIcon, { backgroundColor: iconBgColor }]}>
          <Feather name={icon} size={24} color="#fff" />
        </View>
        <View style={styles.roleContent}>
          <Text style={styles.roleTitle}>{title}</Text>
          <Text style={styles.roleDescription}>{description}</Text>
        </View>
        <Feather name="arrow-right" size={24} color="#0F8154" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  inner: {
    width: '100%',
    alignSelf: 'center',
    gap: 12,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBadge: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginBottom: 16,
  },
  logo: {
    width: 72,
    height: 72,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    fontWeight: '500',
    fontSize: 16,
  },
  tagline: {
    color: 'rgba(255,255,255,0.75)',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 14,
  },
  options: {
    gap: 16,
  },
  optionsWide: {
    maxWidth: 680,
    alignSelf: 'center',
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  roleIcon: {
    padding: 14,
    borderRadius: 12,
  },
  roleContent: {
    flex: 1,
    gap: 4,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  roleDescription: {
    color: '#6B7280',
    lineHeight: 18,
    fontSize: 14,
  },
  footerText: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
  },
  formCard: {
    marginTop: 12,
    overflow: 'visible',
  },
  formCardWide: {
    maxWidth: 760,
    alignSelf: 'center',
  },
});
