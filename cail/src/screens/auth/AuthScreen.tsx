import { useState } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useResponsiveLayout } from '@/hooks/useResponsive';
import { UserRole } from '@/types';
import { LoginForm } from './LoginForm';
import { RegisterCandidateForm } from './RegisterCandidateForm';
import { RegisterEmployerForm } from './RegisterEmployerForm';

const logo = require('@/assets/logo.png');

type AuthMode = 'select' | 'login' | 'register';

type AuthScreenProps = {
  onAuthSuccess: (role: UserRole, data: any) => void;
  onShowTerms: () => void;
  onLoginStart?: () => void;
};

export function AuthScreen({ onAuthSuccess, onShowTerms, onLoginStart }: AuthScreenProps) {
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

  const content = (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, { paddingHorizontal: horizontalGutter }]}>
        <View style={[styles.inner, { maxWidth: contentWidth }]}>
          {/* Hero Section */}
          {mode === 'select' && (
            <View style={styles.heroSection}>
              {/* Logo Badge */}
              <View style={styles.logoBadge}>
                <View style={styles.logoInner}>
                  <Image source={logo} style={styles.logo} resizeMode="contain" />
                </View>
              </View>

              {/* Hero Text */}
              <View style={styles.heroText}>
                <View style={styles.heroPill}>
                  <Feather name="briefcase" size={14} color="#FFFFFF" />
                  <Text style={styles.heroPillText}>CAIL</Text>
                </View>
                <Text style={styles.headline}>Bolsa de Empleo</Text>
                <Text style={styles.subtitle}>Cámara de Industrias de Loja</Text>
              </View>
            </View>
          )}

          {/* Selection Mode - Role Cards */}
          {mode === 'select' ? (
            <View style={[styles.selectionSection, (isTablet || isDesktop) && styles.selectionWide]}>
              <View style={styles.roleCards}>
                <RoleCard
                  title="Soy Candidato"
                  description="Busco oportunidades laborales"
                  icon="user"
                  color="#0B7A4D"
                  onPress={() => handleRoleSelect('candidate')}
                />

                <RoleCard
                  title="Soy Empleador"
                  description="Busco talento para mi empresa"
                  icon="briefcase"
                  color="#F59E0B"
                  onPress={() => handleRoleSelect('employer')}
                />
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Feather name="shield" size={16} color="rgba(255,255,255,0.6)" />
                <Text style={styles.footerText}>
                  Conectando talento con oportunidades en Loja
                </Text>
              </View>
            </View>
          ) : (
            /* Login/Register Forms */
            <View style={[styles.formCard, (isTablet || isDesktop) && styles.formCardWide]}>
              {mode === 'login' && (
                <LoginForm
                  role={selectedRole}
                  onSuccess={handleSuccess}
                  onBack={() => setMode('select')}
                  onSwitchToRegister={() => setMode('register')}
                  onLoginStart={onLoginStart}
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
            </View>
          )}


        </View>
      </View>
    </SafeAreaView>
  );

  return mode === 'select' ? (
    <LinearGradient colors={['#0B7A4D', '#0A6B43', '#085C3A']} style={styles.gradient}>
      {content}
    </LinearGradient>
  ) : (
    <View style={[styles.gradient, styles.plainBackground]}>{content}</View>
  );
}

function RoleCard({
  title,
  description,
  icon,
  color,
  onPress,
}: {
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <View style={styles.roleCard}>
        {/* Header */}
        <View style={styles.roleHeader}>
          <View style={[styles.roleIcon, { backgroundColor: color }]}>
            <Feather name={icon} size={28} color="#FFFFFF" />
          </View>
          <View style={styles.roleHeaderText}>
            <Text style={styles.roleTitle}>{title}</Text>
            <Text style={styles.roleDescription}>{description}</Text>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.roleAction}>
          <Text style={[styles.roleActionText, { color }]}>Continuar</Text>
          <Feather name="arrow-right" size={20} color={color} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  plainBackground: {
    backgroundColor: '#0B7A4D',
  },
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  inner: {
    width: '100%',
    alignSelf: 'center',
    gap: 24,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    gap: 20,
    paddingBottom: 12,
  },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  heroText: {
    alignItems: 'center',
    gap: 8,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  featurePillText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },

  // Selection Section
  selectionSection: {
    gap: 20,
  },
  selectionWide: {
    maxWidth: 720,
    alignSelf: 'center',
  },
  sectionHeader: {
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },

  // Role Cards
  roleCards: {
    gap: 16,
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  roleIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleHeaderText: {
    flex: 1,
    gap: 4,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  roleDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Features List
  featuresList: {
    gap: 10,
    paddingLeft: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  featureText: {
    fontSize: 13,
    color: '#4B5563',
    flex: 1,
  },

  // Role Action
  roleAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  roleActionText: {
    fontSize: 15,
    fontWeight: '700',
  },

  legalContainer: {
    alignItems: 'center',
  },
  legalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  legalButtonHero: {
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  legalButtonForm: {
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  legalText: {
    fontSize: 13,
    fontWeight: '700',
  },
  legalTextHero: {
    color: '#FFFFFF',
  },
  legalTextForm: {
    color: '#0F172A',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  footerText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },

  // Form Card
  formCard: {
    marginTop: 0,
    overflow: 'visible',
    backgroundColor: 'transparent',
  },
  formCardWide: {
    maxWidth: 560,
    alignSelf: 'center',
  },
});
