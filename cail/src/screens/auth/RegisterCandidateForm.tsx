import { useState } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';

interface RegisterCandidateFormProps {
  onSuccess: (data: any) => void;
  onBack: () => void;
  onSwitchToLogin: () => void;
}

type TabType = 'personal' | 'profesional';

export function RegisterCandidateForm({ onSuccess, onBack, onSwitchToLogin }: RegisterCandidateFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  
  // Información Personal
  const [fullName, setFullName] = useState('');
  const [cedula, setCedula] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Loja');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Información Profesional
  const [professionalSummary, setProfessionalSummary] = useState('');
  const [technicalSkills, setTechnicalSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [degree, setDegree] = useState('');
  const [softSkills, setSoftSkills] = useState('');
  const [competencies, setCompetencies] = useState<string[]>([]);
  const [newCompetency, setNewCompetency] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [experienceSummary, setExperienceSummary] = useState('');

  const handleSubmit = () => {
    if (activeTab === 'personal') {
      if (!fullName || !cedula || !email || !password || !confirmPassword) {
        Alert.alert('Campos incompletos', 'Completa todos los campos requeridos.');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Las contraseñas no coinciden.');
        return;
      }
      setActiveTab('profesional');
      return;
    }

    // Submit final
    onSuccess({
      id: 'candidate-2',
      name: fullName,
      email,
      progress: 0.4,
    });
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setTechnicalSkills([...technicalSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setTechnicalSkills(technicalSkills.filter((_, i) => i !== index));
  };

  const addCompetency = () => {
    if (newCompetency.trim()) {
      setCompetencies([...competencies, newCompetency.trim()]);
      setNewCompetency('');
    }
  };

  const removeCompetency = (index: number) => {
    setCompetencies(competencies.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      {/* Main Card */}
      <View style={styles.card}>
        {/* Header + Progress */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Feather name="arrow-left" size={20} color="#0B7A4D" />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: activeTab === 'personal' ? '50%' : '100%' }]} />
            </View>
            <Text style={styles.progressText}>
              Paso {activeTab === 'personal' ? '1' : '2'} de 2
            </Text>
          </View>
        </View>

        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <View style={styles.iconInner}>
              <Feather name="user-plus" size={24} color="#FFFFFF" />
            </View>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>
              {activeTab === 'personal' ? 'Información personal' : 'Información profesional'}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'personal' && styles.tabActive]}
            onPress={() => setActiveTab('personal')}
          >
            <Feather 
              name="user" 
              size={16} 
              color={activeTab === 'personal' ? '#0B7A4D' : '#9CA3AF'} 
            />
            <Text style={[styles.tabText, activeTab === 'personal' && styles.tabTextActive]}>
              Personal
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'profesional' && styles.tabActive]}
            onPress={() => setActiveTab('profesional')}
          >
            <Feather 
              name="briefcase" 
              size={16} 
              color={activeTab === 'profesional' ? '#0B7A4D' : '#9CA3AF'} 
            />
            <Text style={[styles.tabText, activeTab === 'profesional' && styles.tabTextActive]}>
              Profesional
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Content */}
        <ScrollView 
          style={styles.formScroll} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.formContent}
        >
          {activeTab === 'personal' ? (
            <View style={styles.form}>
              {/* Datos Básicos */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Feather name="file-text" size={16} color="#0B7A4D" />
                  <Text style={styles.sectionTitle}>Datos básicos</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nombre completo *</Text>
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Ej: María Fernanda Calle"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.flex1]}>
                    <Text style={styles.label}>Cédula *</Text>
                    <TextInput
                      style={styles.input}
                      value={cedula}
                      onChangeText={setCedula}
                      placeholder="0000000000"
                      keyboardType="numeric"
                      maxLength={10}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  <View style={[styles.inputGroup, styles.flex1]}>
                    <Text style={styles.label}>Teléfono *</Text>
                    <TextInput
                      style={styles.input}
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="0999999999"
                      keyboardType="phone-pad"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Fecha de nacimiento</Text>
                  <TextInput
                    style={styles.input}
                    value={birthDate}
                    onChangeText={setBirthDate}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Correo electrónico *</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="tu@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Ubicación */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Feather name="map-pin" size={16} color="#3B82F6" />
                  <Text style={styles.sectionTitle}>Ubicación</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Dirección</Text>
                  <TextInput
                    style={styles.input}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Calle, número, barrio"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Ciudad *</Text>
                  <TextInput
                    style={styles.input}
                    value={city}
                    onChangeText={setCity}
                    placeholder="Loja"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Seguridad */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Feather name="lock" size={16} color="#EF4444" />
                  <Text style={styles.sectionTitle}>Seguridad</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contraseña *</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Mínimo 6 caracteres"
                      secureTextEntry={!showPassword}
                      placeholderTextColor="#9CA3AF"
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

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirmar contraseña *</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Repite tu contraseña"
                      secureTextEntry={!showConfirmPassword}
                      placeholderTextColor="#9CA3AF"
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
            </View>
          ) : (
            <View style={styles.form}>
              {/* Perfil Profesional */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Feather name="file-text" size={16} color="#0B7A4D" />
                  <Text style={styles.sectionTitle}>Perfil profesional</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Resumen profesional</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={professionalSummary}
                    onChangeText={setProfessionalSummary}
                    placeholder="Describe brevemente tu perfil y objetivos profesionales..."
                    multiline
                    numberOfLines={4}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Habilidades Técnicas */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Feather name="code" size={16} color="#3B82F6" />
                  <Text style={styles.sectionTitle}>Habilidades técnicas</Text>
                </View>
                <Text style={styles.sectionHint}>
                  Tecnologías, herramientas y software que dominas
                </Text>

                <View style={styles.skillInput}>
                  <TextInput
                    style={[styles.input, styles.flex1]}
                    value={newSkill}
                    onChangeText={setNewSkill}
                    placeholder="Ej: Excel, Python, AutoCAD..."
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity style={styles.addButton} onPress={addSkill}>
                    <Feather name="plus" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>

                {technicalSkills.length > 0 && (
                  <View style={styles.chipContainer}>
                    {technicalSkills.map((skill, index) => (
                      <View key={index} style={styles.chipBlue}>
                        <Text style={styles.chipTextBlue}>{skill}</Text>
                        <TouchableOpacity onPress={() => removeSkill(index)}>
                          <Feather name="x" size={14} color="#3B82F6" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Formación */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Feather name="book-open" size={16} color="#8B5CF6" />
                  <Text style={styles.sectionTitle}>Formación académica</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nivel de educación</Text>
                  <TextInput
                    style={styles.input}
                    value={educationLevel}
                    onChangeText={setEducationLevel}
                    placeholder="Bachiller, Tecnólogo, Universitario, Postgrado"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Título o carrera</Text>
                  <TextInput
                    style={styles.input}
                    value={degree}
                    onChangeText={setDegree}
                    placeholder="Ej: Ingeniería en Sistemas"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Competencias */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Feather name="star" size={16} color="#F59E0B" />
                  <Text style={styles.sectionTitle}>Competencias clave</Text>
                </View>

                <View style={styles.skillInput}>
                  <TextInput
                    style={[styles.input, styles.flex1]}
                    value={newCompetency}
                    onChangeText={setNewCompetency}
                    placeholder="Ej: Gestión de proyectos, Negociación..."
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity style={[styles.addButton, styles.addButtonYellow]} onPress={addCompetency}>
                    <Feather name="plus" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>

                {competencies.length > 0 && (
                  <View style={styles.chipContainer}>
                    {competencies.map((comp, index) => (
                      <View key={index} style={styles.chipYellow}>
                        <Text style={styles.chipTextYellow}>{comp}</Text>
                        <TouchableOpacity onPress={() => removeCompetency(index)}>
                          <Feather name="x" size={14} color="#F59E0B" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Experiencia */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Feather name="briefcase" size={16} color="#10B981" />
                  <Text style={styles.sectionTitle}>Experiencia laboral</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Años de experiencia</Text>
                  <TextInput
                    style={styles.input}
                    value={yearsExperience}
                    onChangeText={setYearsExperience}
                    placeholder="Ej: 3 años, 5+ años, Sin experiencia"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Resumen de experiencia</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={experienceSummary}
                    onChangeText={setExperienceSummary}
                    placeholder="Describe brevemente tu experiencia laboral relevante..."
                    multiline
                    numberOfLines={4}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            </View>
          )}

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Feather name="shield" size={16} color="#3B82F6" />
            <Text style={styles.infoText}>
              <Text style={styles.infoBold}>Proceso de validación: </Text>
              Tu perfil será revisado por CAIL. Podrás postular a ofertas una vez validado.
            </Text>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity 
            onPress={handleSubmit}
            style={styles.submitButton}
            activeOpacity={0.8}
          >
            <Text style={styles.submitText}>
              {activeTab === 'personal' ? 'Continuar' : 'Crear cuenta'}
            </Text>
            <Feather name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={onSwitchToLogin}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    gap: 12,
    marginBottom: 16,
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
  progressContainer: {
    flex: 1,
    gap: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E6F4EC',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0B7A4D',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0B7A4D',
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
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#0B7A4D',
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

  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#0B7A4D',
  },

  // Form
  formScroll: {
    maxHeight: 380,
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
  sectionHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: -8,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  flex1: {
    flex: 1,
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

  // Skills
  skillInput: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonYellow: {
    backgroundColor: '#F59E0B',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipBlue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  chipTextBlue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  chipYellow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  chipTextYellow: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
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
    backgroundColor: '#0B7A4D',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    color: '#0B7A4D',
    fontSize: 13,
    fontWeight: '600',
  },
});
