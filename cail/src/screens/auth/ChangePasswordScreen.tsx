import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useResponsiveLayout } from '@/hooks/useResponsive';

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

  const handleSubmit = () => {
    if (!tempPassword) {
      Alert.alert('Campo requerido', 'Ingresa tu contraseña temporal.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Contraseña débil', 'Usa al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Validación', 'Las contraseñas no coinciden.');
      return;
    }
    onPasswordChanged();
  };

  return (
    <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={[styles.container, { paddingHorizontal: horizontalGutter }]}>
          {/* Header con ícono */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Feather name="shield" size={40} color="#F59E0B" />
            </View>
            <Text style={styles.title}>Cambio de Contraseña Obligatorio</Text>
            <Text style={styles.subtitle}>
              Por seguridad, debes cambiar tu contraseña temporal
            </Text>
          </View>

          {/* Card con información de empresa */}
          <View style={[styles.card, { maxWidth: contentWidth, alignSelf: 'center' }]}>
            <View style={styles.companyInfo}>
              <View style={styles.companyIcon}>
                <Feather name="briefcase" size={20} color="#F59E0B" />
              </View>
              <View style={styles.companyDetails}>
                <Text style={styles.companyLabel}>Empresa: <Text style={styles.companyName}>{userData?.company || 'CAFRILOSA'}</Text></Text>
                <Text style={styles.contactLabel}>Contacto: <Text style={styles.contactName}>{userData?.contactName || 'María José Espinoza'}</Text></Text>
              </View>
            </View>

            {/* Formulario */}
            <View style={styles.form}>
              {/* Contraseña Temporal */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contraseña Temporal *</Text>
                <View style={styles.passwordInput}>
                  <TextInput
                    style={styles.input}
                    value={tempPassword}
                    onChangeText={setTempPassword}
                    placeholder="Contraseña enviada por correo"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showTempPassword}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowTempPassword(!showTempPassword)}
                    style={styles.eyeButton}
                  >
                    <Feather 
                      name={showTempPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color="#6B7280" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Nueva Contraseña */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nueva Contraseña *</Text>
                <View style={styles.passwordInput}>
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Crea una contraseña segura"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showNewPassword}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.eyeButton}
                  >
                    <Feather 
                      name={showNewPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color="#6B7280" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirmar Nueva Contraseña */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmar Nueva Contraseña *</Text>
                <View style={styles.passwordInput}>
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Repite tu nueva contraseña"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <Feather 
                      name={showConfirmPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color="#6B7280" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Info box */}
              <View style={styles.infoBox}>
                <Feather name="info" size={16} color="#1E40AF" />
                <Text style={styles.infoText}>
                  <Text style={styles.infoBold}>Proceso de Validación:</Text>
                  {'\n'}Tu perfil será revisado y validado por CAIL. Podrás postular a ofertas una vez validado tu perfil.
                </Text>
              </View>

              {/* Botón Cambiar Contraseña */}
              <TouchableOpacity 
                onPress={handleSubmit}
                style={styles.submitButton}
              >
                <Feather name="lock" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.submitText}>Cambiar Contraseña</Text>
              </TouchableOpacity>

              {/* Botón Cerrar sesión */}
              <TouchableOpacity 
                onPress={onLogout}
                style={styles.logoutButton}
              >
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
  },
  companyInfo: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  companyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyDetails: {
    flex: 1,
  },
  companyLabel: {
    fontSize: 13,
    color: '#92400E',
    marginBottom: 4,
  },
  companyName: {
    fontWeight: '700',
    color: '#78350F',
  },
  contactLabel: {
    fontSize: 13,
    color: '#92400E',
  },
  contactName: {
    fontWeight: '600',
    color: '#78350F',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  passwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  eyeButton: {
    padding: 12,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    gap: 8,
    alignItems: 'flex-start',
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
  },
  infoBold: {
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },
});
