import { useState } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { UserRole } from '@/types';

interface LoginFormProps {
  role: UserRole;
  onSuccess: (data: any) => void;
  onBack: () => void;
  onSwitchToRegister: () => void;
}

export function LoginForm({ role, onSuccess, onBack, onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    if (!email || !password) {
      Alert.alert('Campos incompletos', 'Ingresa tu correo y contraseña.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (role === 'candidate') {
        onSuccess({
          id: 'candidate-1',
          name: 'María Fernanda Calle',
          email,
          progress: 0.82,
        });
      } else {
        onSuccess({
          id: 'employer-1',
          company: 'Industrias ABC',
          contactName: 'Patricia Ludeña',
          email,
          needsPasswordChange: false,
          isEmailVerified: true,
        });
      }
    }, 700);
  };

  const accentColor = role === 'candidate' ? '#0B7A4D' : '#F59E0B';
  const accentLight = role === 'candidate' ? '#ECFDF5' : '#FEF3C7';
  const accentIcon = role === 'candidate' ? 'user' : 'briefcase';

  return (
    <View style={styles.card}>
      {/* Header dentro de la card */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Feather name="arrow-left" size={20} color="#6B7280" />
        </TouchableOpacity>
        <View style={styles.headerBadge}>
          <Feather name="shield" size={14} color={accentColor} />
          <Text style={[styles.headerBadgeText, { color: accentColor }]}>Acceso Seguro</Text>
        </View>
      </View>

      {/* Icon Circle */}
      <View style={[styles.iconCircle, { backgroundColor: accentLight }]}>
        <View style={[styles.iconInner, { backgroundColor: accentColor }]}>
          <Feather name={accentIcon} size={28} color="#FFFFFF" />
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>Bienvenido de nuevo</Text>
      <Text style={styles.subtitle}>
        {role === 'candidate' 
          ? 'Accede como Candidato' 
          : 'Accede como Empleador'}
      </Text>

      {/* Form */}
      <View style={styles.form}>
        {/* Email Input */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Feather name="mail" size={16} color="#6B7280" />
            <Text style={styles.label}>Correo electrónico</Text>
          </View>
          <View style={styles.inputWrapper}>
            <InputField
              value={email}
              onChangeText={setEmail}
              placeholder={role === 'candidate' ? 'tu@email.com' : 'empresa@dominio.com'}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Password Input */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Feather name="lock" size={16} color="#6B7280" />
            <Text style={styles.label}>Contraseña</Text>
          </View>
          <View style={styles.inputWrapper}>
            <View style={styles.passwordContainer}>
              <InputField
                value={password}
                onChangeText={setPassword}
                placeholder="Ingresa tu contraseña"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                <Feather 
                  name={showPassword ? 'eye-off' : 'eye'} 
                  size={18} 
                  color="#9CA3AF" 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={[styles.forgotText, { color: accentColor }]}>
            ¿Olvidaste tu contraseña?
          </Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity 
          onPress={handleSubmit}
          style={[styles.submitButton, { backgroundColor: accentColor }]}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.submitText}>Ingresando...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.submitText}>Iniciar Sesión</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>¿Nuevo en CAIL?</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Register Link */}
        <TouchableOpacity 
          onPress={onSwitchToRegister}
          style={styles.registerButton}
        >
          <Feather name="user-plus" size={18} color={accentColor} />
          <Text style={[styles.registerText, { color: accentColor }]}>
            Crear cuenta nueva
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Feather name="shield" size={14} color="rgba(0,0,0,0.4)" />
        <Text style={styles.footerText}>
          Al continuar, aceptas los términos y condiciones de uso
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Card principal - ahora es el contenedor raíz
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },

  // Header dentro de la card
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Icon Circle
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Title
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 28,
    textAlign: 'center',
  },

  // Form
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  inputWrapper: {
    position: 'relative',
  },

  // Password Input
  passwordContainer: {
    position: 'relative',
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 8,
  },

  // Forgot Password
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Submit Button
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
  },

  // Register Button
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  registerText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Footer dentro de la card
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  footerText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
});