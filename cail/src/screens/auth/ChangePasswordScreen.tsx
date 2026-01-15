import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View, TextInput, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useResponsiveLayout } from '@/hooks/useResponsive';
import { LoadingSplash } from '@/components/ui/LoadingSplash';
import { PasswordStrength, validatePassword } from '@/components/ui/PasswordStrength';
import { authService } from '@/services/auth.service';

interface ChangePasswordScreenProps {
  userData: any;
  onPasswordChanged: () => void;
  onLogout: () => void;
}

export function ChangePasswordScreen({ userData, onPasswordChanged, onLogout }: ChangePasswordScreenProps) {
  const { contentWidth, horizontalGutter } = useResponsiveLayout();
  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [splashSuccess, setSplashSuccess] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(userData?.showWelcomeModal || false);

  const handleSubmit = async () => {
    if (!tempPassword) {
      Alert.alert('Campo requerido', 'Ingresa tu contraseña temporal.');
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      Alert.alert('Contraseña inválida', passwordValidation.errors[0]);
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Validación', 'Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      // Primero hacer login con la contraseña temporal para establecer auth.currentUser
      // Esto es necesario porque después del registro el usuario no está logueado
      console.log('🔐 Logging in with temp password before changing...');
      await authService.login(userData.email, tempPassword);

      // Ahora cambiar la contraseña (auth.currentUser ya está establecido)
      await authService.changePassword(tempPassword, newPassword);
      setShowSplash(true);
      setSplashSuccess(true);
    } catch (error: any) {
      console.error('❌ Password change error:', error);
      let errorMessage = 'No se pudo cambiar la contraseña';

      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'La contraseña temporal es incorrecta. Verifica el email recibido.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos. Espera unos minutos e intenta de nuevo.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
      setLoading(false);
    }
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
    setSplashSuccess(false);
    setLoading(false);
    onPasswordChanged();
  };

  return (
    <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={[styles.container, { paddingHorizontal: horizontalGutter }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Card */}
          <View style={[styles.card, { maxWidth: contentWidth, alignSelf: 'center' }]}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <View style={styles.iconInner}>
                  <Feather name="shield" size={24} color="#FFFFFF" />
                </View>
              </View>
              <View style={styles.headerText}>
                <Text style={styles.title}>Cambio de Contraseña</Text>
                <Text style={styles.subtitle}>Por seguridad, actualiza tu contraseña</Text>
              </View>
            </View>

            {/* Company Info Banner */}
            <View style={styles.companyBanner}>
              <View style={styles.companyIcon}>
                <Feather name="briefcase" size={16} color="#F59E0B" />
              </View>
              <View style={styles.companyDetails}>
                <Text style={styles.companyText}>
                  <Text style={styles.companyLabel}>Empresa: </Text>
                  <Text style={styles.companyValue}>{userData?.company || 'CAFRILOSA'}</Text>
                </Text>
                <Text style={styles.companyText}>
                  <Text style={styles.companyLabel}>Contacto: </Text>
                  <Text style={styles.companyValue}>{userData?.contactName || 'María José Espinoza'}</Text>
                </Text>
              </View>
            </View>

            {/* Form Content */}
            <ScrollView
              style={styles.formScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.formContent}
            >
              <View style={styles.form}>
                {/* Contraseña Temporal */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Feather name="key" size={16} color="#EF4444" />
                    <Text style={styles.sectionTitle}>Contraseña temporal</Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Contraseña temporal *</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={styles.passwordInput}
                        value={tempPassword}
                        onChangeText={setTempPassword}
                        placeholder="Ingresa la contraseña enviada por correo"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showTempPassword}
                      />
                      <TouchableOpacity
                        onPress={() => setShowTempPassword(!showTempPassword)}
                        style={styles.passwordToggle}
                      >
                        <Feather
                          name={showTempPassword ? 'eye-off' : 'eye'}
                          size={18}
                          color="#9CA3AF"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Nueva Contraseña */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Feather name="lock" size={16} color="#0B7A4D" />
                    <Text style={styles.sectionTitle}>Nueva contraseña</Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nueva contraseña *</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={styles.passwordInput}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="Mínimo 12 caracteres"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showNewPassword}
                      />
                      <TouchableOpacity
                        onPress={() => setShowNewPassword(!showNewPassword)}
                        style={styles.passwordToggle}
                      >
                        <Feather
                          name={showNewPassword ? 'eye-off' : 'eye'}
                          size={18}
                          color="#9CA3AF"
                        />
                      </TouchableOpacity>
                    </View>
                    <PasswordStrength password={newPassword} variant="employer" />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Confirmar contraseña *</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={styles.passwordInput}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Repite tu nueva contraseña"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showConfirmPassword}
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={styles.passwordToggle}
                      >
                        <Feather
                          name={showConfirmPassword ? 'eye-off' : 'eye'}
                          size={18}
                          color="#9CA3AF"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Info Box */}
                <View style={styles.infoBox}>
                  <Feather name="shield" size={16} color="#3B82F6" />
                  <Text style={styles.infoText}>
                    <Text style={styles.infoBold}>Seguridad: </Text>
                    Tu nueva contraseña debe tener al menos 12 caracteres, una mayúscula, un número y un carácter especial.
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={handleSubmit}
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Text style={styles.submitText}>
                  {loading ? 'Cambiando...' : 'Cambiar contraseña'}
                </Text>
                <Feather name="arrow-right" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onLogout}
                style={styles.logoutButton}
              >
                <Feather name="log-out" size={16} color="#6B7280" />
                <Text style={styles.logoutText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            Tu contraseña temporal fue enviada a tu correo electrónico
          </Text>
        </ScrollView>
      </SafeAreaView>

      {/* Loading Splash */}
      <LoadingSplash
        visible={showSplash}
        message="Actualizando contraseña..."
        variant="employer"
        showSuccess={splashSuccess}
        onSuccessComplete={handleSplashComplete}
      />

      {/* Welcome Modal for new employer registration */}
      <Modal
        visible={showWelcomeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWelcomeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowWelcomeModal(false)}
            >
              <Feather name="x" size={20} color="#6B7280" />
            </TouchableOpacity>

            <View style={styles.successIcon}>
              <Feather name="check" size={40} color="#fff" />
            </View>

            <Text style={styles.modalTitle}>¡Registro Exitoso!</Text>

            <View style={styles.successBadge}>
              <Feather name="check-square" size={16} color="#059669" />
              <Text style={styles.successText}>Empresa registrada con éxito</Text>
            </View>

            <Text style={styles.modalEmpresa}>{userData?.company}</Text>

            <View style={styles.modalInfoBox}>
              <Feather name="mail" size={16} color="#3B82F6" />
              <Text style={styles.modalInfoText}>
                Te hemos enviado un correo con tu contraseña temporal. Ingrésala a continuación para establecer tu nueva contraseña.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowWelcomeModal(false)}
            >
              <Text style={styles.modalButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    maxHeight: '85%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
  },

  // Company Banner
  companyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  companyIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyDetails: {
    flex: 1,
    gap: 4,
  },
  companyText: {
    fontSize: 13,
    lineHeight: 18,
  },
  companyLabel: {
    color: '#92400E',
    fontWeight: '500',
  },
  companyValue: {
    color: '#78350F',
    fontWeight: '700',
  },

  // Form
  formScroll: {
    maxHeight: 340,
  },
  formContent: {
    paddingBottom: 8,
  },
  form: {
    gap: 20,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },

  // Password
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    paddingRight: 50,
    fontSize: 14,
    color: '#1F2937',
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 8,
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
  },
  infoBold: {
    fontWeight: '700',
  },

  // Actions
  actions: {
    marginTop: 16,
    gap: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  logoutText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },

  // Footer
  footer: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '500',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    position: 'relative',
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#D1FAE5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginBottom: 16,
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  modalEmpresa: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 16,
    width: '100%',
  },
  modalInfoText: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
  },
  modalButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});