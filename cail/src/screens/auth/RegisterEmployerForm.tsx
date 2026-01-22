import { useState, useEffect } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { authService } from '@/services/auth.service';

interface RegisterEmployerFormProps {
  onSuccess: (data: any) => void;
  onBack: () => void;
  onSwitchToLogin: () => void;
}

// Base de datos simulada de empresas
// Empresas cargadas dinámicamente desde el backend

export function RegisterEmployerForm({ onSuccess, onBack, onSwitchToLogin }: RegisterEmployerFormProps) {
  const [empresaNombre, setEmpresaNombre] = useState('');
  const [cargo, setCargo] = useState('');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [ruc, setRuc] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState('');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await authService.getCompanies();
        setCompanies(data);
      } catch (error) {
        console.error('Error fetching companies:', error);
        Alert.alert('Error', 'No se pudieron cargar las empresas.');
      }
    };
    fetchCompanies();
  }, []);

  // Filtrar empresas según lo que el usuario escribe
  const empresasFiltradas = companies.filter(empresa =>
    empresa.razonSocial.toLowerCase().includes(empresaNombre.toLowerCase())
  );
  const dropdownActivo = showDropdown && empresasFiltradas.length > 0;

  const seleccionarEmpresa = (empresa: any) => {
    setEmpresaNombre(empresa.razonSocial);
    setRuc(empresa.ruc);
    setAddress(empresa.direccion || '');
    setCity(empresa.ciudad || '');
    setWebsite(empresa.website || '');
    setDescription(empresa.descripcion || '');

    // NO autocompletar contacto/cargo/email, el usuario debe llenarlos
    setShowDropdown(false);
    setEmpresaSeleccionada(empresa.razonSocial);
  };

  const handleSubmit = async () => {
    if (!empresaNombre || !cargo || !contacto || !telefono || !correo || !password || !confirmPassword) {
      Alert.alert('Campos incompletos', 'Completa todos los campos del formulario.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({
        email: correo,
        password: password,
        nombreCompleto: contacto,
        telefono: telefono,
        tipoUsuario: 'RECLUTADOR',
        employerData: {
          nombreEmpresa: empresaNombre,
          cargo: cargo,
          nombreContacto: contacto,
          direccion: address,
          ciudad: city,
          sitioWeb: website,
          descripcion: description,
          ruc: ruc,
        },
      });

      // Store data and show modal
      setLoading(false);
      setSuccessData({
        id: response.idCuenta,
        company: empresaNombre,
        contactName: contacto,
        email: correo,
        needsPasswordChange: false, // SKIP ChangePassword Screen
        isEmailVerified: false,
      });
      setShowWelcomeModal(true);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Error al crear la cuenta');
    }
  };

  const handleCloseModal = () => {
    setShowWelcomeModal(false);
    // Do not auto-login (onSuccess). Redirect to Login screen instead.
    if (onSwitchToLogin) {
      onSwitchToLogin();
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Card */}
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Feather name="arrow-left" size={20} color="#F59E0B" />
          </TouchableOpacity>
        </View>

        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <View style={styles.iconInner}>
              <Feather name="briefcase" size={24} color="#FFFFFF" />
            </View>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Registro de Empresa</Text>
            <Text style={styles.subtitle}>Gestión de Recursos Humanos</Text>
          </View>
        </View>

        {/* Form Content */}
        <ScrollView
          style={styles.formScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.formContent}
        >
          <View style={styles.form}>
            {/* Información de la Empresa */}
            <View style={[styles.section, dropdownActivo && styles.sectionRaised]}>
              <View style={styles.sectionHeader}>
                <Feather name="briefcase" size={16} color="#F59E0B" />
                <Text style={styles.sectionTitle}>Información de la empresa</Text>
              </View>

              {/* Nombre de empresa con dropdown */}
              <View style={[styles.inputGroup, dropdownActivo && styles.inputGroupRaised]}>
                <Text style={styles.label}>Nombre de empresa *</Text>
                <View style={styles.dropdownInput}>
                  <TextInput
                    style={styles.input}
                    value={empresaNombre}
                    onFocus={() => setShowDropdown(true)}
                    onChangeText={(text) => {
                      setEmpresaNombre(text);
                      setShowDropdown(true);
                    }}
                    placeholder="Selecciona o busca una empresa..."
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity
                    onPress={() => setShowDropdown((prev) => !prev)}
                    style={styles.dropdownIcon}
                  >
                    <Feather
                      name={showDropdown ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.hint}>
                  <Feather name="info" size={10} color="#6B7280" /> Selecciona de la lista o escribe para buscar
                </Text>

                {/* Dropdown de opciones */}
                {dropdownActivo && (
                  <View style={[styles.dropdown, styles.dropdownElevated]}>
                    <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                      {empresasFiltradas.map((empresa, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.dropdownItem}
                          onPress={() => seleccionarEmpresa(empresa)}
                        >
                          <Feather name="briefcase" size={14} color="#6B7280" />
                          <Text style={styles.dropdownItemText}>{empresa.razonSocial}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Campos Editables (Auto-completados pero modificables) */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Dirección</Text>
                <TextInput
                  style={styles.input}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Dirección de la empresa"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ciudad</Text>
                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder="Ciudad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Sitio Web</Text>
                <TextInput
                  style={styles.input}
                  value={website}
                  onChangeText={setWebsite}
                  placeholder="Sitio Web"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descripción</Text>
                <TextInput
                  style={styles.input}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  placeholder="Descripción"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Datos del Responsable */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Feather name="user" size={16} color="#0B7A4D" />
                <Text style={styles.sectionTitle}>Datos del responsable</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cargo responsable *</Text>
                <TextInput
                  style={styles.input}
                  value={cargo}
                  onChangeText={setCargo}
                  placeholder="Ej: Gerente de Recursos Humanos"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre del contacto *</Text>
                <TextInput
                  style={styles.input}
                  value={contacto}
                  onChangeText={setContacto}
                  placeholder="Nombre completo del responsable"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Información de Contacto */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Feather name="phone" size={16} color="#3B82F6" />
                <Text style={styles.sectionTitle}>Información de contacto</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Teléfono *</Text>
                <TextInput
                  style={styles.input}
                  value={telefono}
                  onChangeText={setTelefono}
                  placeholder="Ej: 07-XXXXXXX"
                  keyboardType="phone-pad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Correo electrónico *</Text>
                <TextInput
                  style={styles.input}
                  value={correo}
                  onChangeText={setCorreo}
                  placeholder="correo@empresa.com.ec"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contraseña *</Text>
                <View style={styles.dropdownInput}>
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Contraseña segura"
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.dropdownIcon}
                  >
                    <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmar Contraseña *</Text>
                <View style={styles.dropdownInput}>
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Repite la contraseña"
                    secureTextEntry={!showConfirmPassword}
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.dropdownIcon}
                  >
                    <Feather name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Feather name="shield" size={16} color="#F59E0B" />
              <Text style={styles.infoText}>
                <Text style={styles.infoBold}>Proceso de validación: </Text>
                Tu empresa será verificada por CAIL. Recibirás credenciales por correo una vez aprobada.
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
              {loading ? 'Registrando...' : 'Registrar empresa'}
            </Text>
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Feather name="arrow-right" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={onSwitchToLogin}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Welcome Modal */}
      <Modal
        visible={showWelcomeModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={handleCloseModal}
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

            <Text style={styles.modalEmpresa}>{empresaNombre}</Text>

            <View style={styles.modalInfoBox}>
              <Feather name="info" size={16} color="#3B82F6" />
              <Text style={styles.modalInfoText}>
                El administrador o el encargado autorizado de la empresa ha sido notificado de tu cuenta como reclutador y estás en proceso de validación.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCloseModal}
            >
              <Text style={styles.modalButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },

  // Header inside card
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 26,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
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

  // Form
  formScroll: {
    maxHeight: 420,
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
  sectionRaised: {
    zIndex: 20,
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
    position: 'relative',
    zIndex: 1,
  },
  inputGroupRaised: {
    zIndex: 30,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
    borderRadius: 10,
  },
  hint: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  dropdownIcon: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  dropdown: {
    position: 'absolute',
    top: 72,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dropdownElevated: {
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
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
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#6B7280',
    fontSize: 13,
  },
  loginLink: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '600',
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
  modalRedirect: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  modalButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
