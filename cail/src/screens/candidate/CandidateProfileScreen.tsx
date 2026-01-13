import { useMemo, useState, useEffect } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { InputField } from '@/components/ui/InputField';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { useResponsiveLayout } from '@/hooks/useResponsive';
import { CandidateProfileForm } from '@/types';
import { initialCandidateProfile } from '@/data/mockData';
import { colors } from '@/theme/colors';
import { userService } from '@/services/user.service';
import * as DocumentPicker from 'expo-document-picker';

export function CandidateProfileScreen() {
  const { contentWidth } = useResponsiveLayout();
  const [form, setForm] = useState<CandidateProfileForm>(initialCandidateProfile);
  const [loading, setLoading] = useState(true);
  const [newSkill, setNewSkill] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');
  const [newCompetency, setNewCompetency] = useState('');
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'experience'>('personal');
  const [saving, setSaving] = useState(false);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [uploadingCv, setUploadingCv] = useState(false);

  // Load user profile data
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await userService.getProfile();

      if (profile.candidateProfile) {
        setForm({
          fullName: profile.nombreCompleto,
          email: profile.email,
          phone: profile.telefono || '',
          city: profile.candidateProfile.ciudad,
          address: profile.candidateProfile.direccion || '',
          professionalSummary: profile.candidateProfile.resumenProfesional || '',
          technicalSkills: profile.candidateProfile.habilidadesTecnicas || [],
          softSkills: profile.candidateProfile.softSkills || [],
          competencies: profile.candidateProfile.competencias || [],
        });
        setCvUrl(profile.candidateProfile.cvUrl || null);
      }
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const completion = useMemo(() => {
    const fields = [
      form.fullName,
      form.email,
      form.phone,
      form.city,
      form.address,
      form.professionalSummary,
      form.technicalSkills.length ? '1' : '',
      form.softSkills.length ? '1' : '',
      form.competencies.length ? '1' : '',
    ];
    return fields.filter(Boolean).length / fields.length;
  }, [form]);

  const updateField = (key: keyof CandidateProfileForm, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addItem = (key: 'technicalSkills' | 'softSkills' | 'competencies', value: string) => {
    if (!value.trim()) return;
    updateField(key, [...form[key], value.trim()]);
  };

  const removeItem = (key: 'technicalSkills' | 'softSkills' | 'competencies', index: number) => {
    updateField(
      key,
      form[key].filter((_, i) => i !== index),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await userService.updateProfile({
        nombreCompleto: form.fullName,
        telefono: form.phone,
        candidateProfile: {
          ciudad: form.city,
          direccion: form.address,
          resumenProfesional: form.professionalSummary,
          habilidadesTecnicas: form.technicalSkills,
          softSkills: form.softSkills,
          competencias: form.competencies,
          cedula: '', // Mantener valor existente
        },
      });
      Alert.alert('Éxito', 'Tus cambios se guardaron correctamente.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudieron guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0B7A4D" />
        <Text style={{ marginTop: 16, color: colors.textSecondary }}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {/* Hero Card */}
      <View style={[styles.heroCard, { maxWidth: contentWidth }]}>
        <View style={styles.heroContent}>
          <View style={styles.heroIcon}>
            <Feather name="user" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Mi perfil profesional</Text>
            <Text style={styles.heroSubtitle}>
              Administra tus datos personales y profesionales
            </Text>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <View style={styles.progressInfo}>
              <Feather name="target" size={16} color="#FFFFFF" />
              <Text style={styles.progressText}>Progreso del perfil</Text>
            </View>
            <View style={styles.progressBadge}>
              <Text style={styles.progressPercentage}>{Math.round(completion * 100)}%</Text>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${completion * 100}%` }]} />
          </View>
        </View>

        {/* Status Pills */}
        <View style={styles.statusRow}>
          <View style={styles.statusPill}>
            <Feather name="eye" size={12} color="#0B7A4D" />
            <Text style={styles.statusPillText}>Perfil visible</Text>
          </View>
          <View style={[styles.statusPill, styles.statusPillMuted]}>
            <Feather name="shield" size={12} color={colors.textSecondary} />
            <Text style={[styles.statusPillText, styles.statusPillMutedText]}>Verificado</Text>
          </View>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { maxWidth: contentWidth }]}>
        <TabButton
          label="Personal"
          icon="user"
          active={activeTab === 'personal'}
          onPress={() => setActiveTab('personal')}
        />
        <TabButton
          label="Profesional"
          icon="briefcase"
          active={activeTab === 'professional'}
          onPress={() => setActiveTab('professional')}
        />
        <TabButton
          label="Experiencia"
          icon="award"
          active={activeTab === 'experience'}
          onPress={() => setActiveTab('experience')}
        />
      </View>

      {/* Personal Tab */}
      {activeTab === 'personal' && (
        <View style={[styles.sectionCard, { maxWidth: contentWidth }]}>
          <View style={styles.sectionHeader}>
            <Feather name="user" size={20} color="#0B7A4D" />
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Información personal</Text>
              <Text style={styles.sectionSubtitle}>
                Esta información es visible para los empleadores
              </Text>
            </View>
          </View>

          <View style={styles.formSection}>
            <InputField
              label="Nombre completo"
              value={form.fullName}
              onChangeText={(text) => updateField('fullName', text)}
            />
            <InputField
              label="Correo electrónico"
              value={form.email}
              readonly
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <InputField
              label="Teléfono"
              value={form.phone}
              onChangeText={(text) => updateField('phone', text)}
              keyboardType="phone-pad"
            />
            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <InputField
                  label="Ciudad"
                  value={form.city}
                  onChangeText={(text) => updateField('city', text)}
                />
              </View>
            </View>
            <InputField
              label="Dirección completa"
              value={form.address}
              onChangeText={(text) => updateField('address', text)}
            />
          </View>
        </View>
      )}

      {/* Professional Tab */}
      {activeTab === 'professional' && (
        <>
          {/* Professional Summary */}
          <View style={[styles.sectionCard, { maxWidth: contentWidth }]}>
            <View style={styles.sectionHeader}>
              <Feather name="file-text" size={20} color="#0B7A4D" />
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Resumen profesional</Text>
                <Text style={styles.sectionSubtitle}>
                  Describe tu perfil y rol objetivo
                </Text>
              </View>
            </View>

            <View style={styles.formSection}>
              <InputField
                label="Resumen"
                value={form.professionalSummary}
                onChangeText={(text) => updateField('professionalSummary', text)}
                multiline
                style={styles.textArea}
                placeholder="Ej. Ingeniero con 5 años de experiencia en desarrollo de aplicaciones móviles..."
              />
            </View>
          </View>

          {/* Technical Skills */}
          <View style={[styles.sectionCard, { maxWidth: contentWidth }]}>
            <View style={styles.sectionHeader}>
              <Feather name="code" size={20} color="#3B82F6" />
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Habilidades técnicas</Text>
                <Text style={styles.sectionSubtitle}>
                  Agrega tecnologías o certificaciones clave
                </Text>
              </View>
            </View>

            <View style={styles.formSection}>
              {form.technicalSkills.length > 0 && (
                <View style={styles.chipContainer}>
                  {form.technicalSkills.map((skill, index) => (
                    <Pressable
                      key={skill + index}
                      style={styles.skillChip}
                      onPress={() => removeItem('technicalSkills', index)}
                    >
                      <Text style={styles.skillChipText}>{skill}</Text>
                      <Feather name="x" size={14} color="#3B82F6" />
                    </Pressable>
                  ))}
                </View>
              )}

              <View style={styles.addSkillRow}>
                <View style={{ flex: 1 }}>
                  <InputField
                    value={newSkill}
                    onChangeText={setNewSkill}
                    placeholder="Ej. React Native, Python, AWS..."
                  />
                </View>
                <Pressable
                  style={styles.addButton}
                  onPress={() => {
                    addItem('technicalSkills', newSkill);
                    setNewSkill('');
                  }}
                >
                  <Feather name="plus" size={20} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Soft Skills */}
          <View style={[styles.sectionCard, { maxWidth: contentWidth }]}>
            <View style={styles.sectionHeader}>
              <Feather name="heart" size={20} color="#10B981" />
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Habilidades blandas</Text>
                <Text style={styles.sectionSubtitle}>
                  Fortalezas personales y sociales
                </Text>
              </View>
            </View>

            <View style={styles.formSection}>
              {form.softSkills.length > 0 && (
                <View style={styles.chipContainer}>
                  {form.softSkills.map((skill, index) => (
                    <Pressable
                      key={skill + index}
                      style={[styles.skillChip, styles.skillChipGreen]}
                      onPress={() => removeItem('softSkills', index)}
                    >
                      <Text style={[styles.skillChipText, styles.skillChipTextGreen]}>{skill}</Text>
                      <Feather name="x" size={14} color="#10B981" />
                    </Pressable>
                  ))}
                </View>
              )}

              <View style={styles.addSkillRow}>
                <View style={{ flex: 1 }}>
                  <InputField
                    value={newSoftSkill}
                    onChangeText={setNewSoftSkill}
                    placeholder="Ej. Liderazgo, Comunicación..."
                  />
                </View>
                <Pressable
                  style={[styles.addButton, styles.addButtonGreen]}
                  onPress={() => {
                    addItem('softSkills', newSoftSkill);
                    setNewSoftSkill('');
                  }}
                >
                  <Feather name="plus" size={20} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>
          </View>
        </>
      )}

      {/* Experience Tab */}
      {activeTab === 'experience' && (
        <>
          {/* Competencies */}
          <View style={[styles.sectionCard, { maxWidth: contentWidth }]}>
            <View style={styles.sectionHeader}>
              <Feather name="star" size={20} color="#F59E0B" />
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Competencias</Text>
                <Text style={styles.sectionSubtitle}>
                  Selecciona tus competencias clave
                </Text>
              </View>
            </View>

            <View style={styles.formSection}>
              {form.competencies.length > 0 && (
                <View style={styles.chipContainer}>
                  {form.competencies.map((skill, index) => (
                    <Pressable
                      key={skill + index}
                      style={[styles.skillChip, styles.skillChipYellow]}
                      onPress={() => removeItem('competencies', index)}
                    >
                      <Text style={[styles.skillChipText, styles.skillChipTextYellow]}>{skill}</Text>
                      <Feather name="x" size={14} color="#F59E0B" />
                    </Pressable>
                  ))}
                </View>
              )}

              <View style={styles.addSkillRow}>
                <View style={{ flex: 1 }}>
                  <InputField
                    value={newCompetency}
                    onChangeText={setNewCompetency}
                    placeholder="Ej. Gestión de proyectos, Análisis de datos..."
                  />
                </View>
                <Pressable
                  style={[styles.addButton, styles.addButtonYellow]}
                  onPress={() => {
                    addItem('competencies', newCompetency);
                    setNewCompetency('');
                  }}
                >
                  <Feather name="plus" size={20} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>
          </View>

          {/* CV Upload Section */}
          <View style={[styles.sectionCard, { maxWidth: contentWidth }]}>
            <View style={styles.sectionHeader}>
              <Feather name="file-text" size={20} color="#DC2626" />
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Curriculum Vitae</Text>
                <Text style={styles.sectionSubtitle}>
                  Sube tu CV en formato PDF (máximo 5MB)
                </Text>
              </View>
            </View>

            {cvUrl ? (
              <View style={styles.cvUploaded}>
                <View style={styles.cvFileIcon}>
                  <Feather name="file" size={24} color="#DC2626" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cvFileName}>CV Subido</Text>
                  <Pressable onPress={() => Linking.openURL(cvUrl)}>
                    <Text style={styles.cvViewLink}>Ver documento</Text>
                  </Pressable>
                </View>
                <Pressable
                  style={styles.cvDeleteButton}
                  onPress={async () => {
                    setUploadingCv(true);
                    try {
                      await userService.deleteCV();
                      setCvUrl(null);
                      Alert.alert('Éxito', 'CV eliminado correctamente');
                    } catch (error: any) {
                      Alert.alert('Error', error.message || 'No se pudo eliminar el CV');
                    } finally {
                      setUploadingCv(false);
                    }
                  }}
                  disabled={uploadingCv}
                >
                  <Feather name="trash-2" size={18} color="#FFFFFF" />
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={[styles.cvDropzone, uploadingCv && styles.cvDropzoneDisabled]}
                onPress={async () => {
                  if (uploadingCv) return;
                  try {
                    const result = await DocumentPicker.getDocumentAsync({
                      type: 'application/pdf',
                      copyToCacheDirectory: true,
                    });

                    if (result.canceled) return;

                    const file = result.assets[0];
                    if (file.size && file.size > 5 * 1024 * 1024) {
                      Alert.alert('Error', 'El archivo no puede superar 5MB');
                      return;
                    }

                    setUploadingCv(true);
                    const formData = new FormData();
                    formData.append('cv', {
                      uri: file.uri,
                      name: file.name,
                      type: 'application/pdf',
                    } as any);

                    const response = await userService.uploadCV(formData);
                    setCvUrl(response.cvUrl);
                    Alert.alert('Éxito', 'CV subido correctamente');
                  } catch (error: any) {
                    Alert.alert('Error', error.message || 'No se pudo subir el CV');
                  } finally {
                    setUploadingCv(false);
                  }
                }}
                disabled={uploadingCv}
              >
                <View style={styles.cvDropzoneIcon}>
                  {uploadingCv ? (
                    <ActivityIndicator size="small" color="#9CA3AF" />
                  ) : (
                    <Feather name="upload" size={32} color="#9CA3AF" />
                  )}
                </View>
                <Text style={styles.cvDropzoneText}>
                  {uploadingCv ? 'Subiendo...' : 'Toca para seleccionar tu CV'}
                </Text>
                <Text style={styles.cvDropzoneSubtext}>PDF • Máximo 5MB</Text>
              </Pressable>
            )}
          </View>

          {/* Work Experience */}
          <View style={[styles.sectionCard, { maxWidth: contentWidth }]}>
            <View style={styles.sectionHeader}>
              <Feather name="briefcase" size={20} color="#8B5CF6" />
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Experiencia laboral</Text>
                <Text style={styles.sectionSubtitle}>
                  Registra tus últimos cargos o prácticas
                </Text>
              </View>
            </View>

            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Feather name="inbox" size={32} color={colors.textSecondary} />
              </View>
              <Text style={styles.emptyTitle}>Aún no registras experiencia</Text>
              <Text style={styles.emptySubtitle}>
                Agrega tus experiencias para mejorar tus coincidencias con ofertas laborales.
              </Text>
              <Pressable style={styles.emptyButton}>
                <Feather name="plus-circle" size={18} color="#0B7A4D" />
                <Text style={styles.emptyButtonText}>Agregar experiencia</Text>
              </Pressable>
            </View>
          </View>
        </>
      )}

      {/* Save Button */}
      <Button
        label={saving ? 'Guardando...' : 'Guardar cambios'}
        onPress={handleSave}
        style={[styles.saveButton, { maxWidth: contentWidth }]}
        loading={saving}
        disabled={saving}
      />
    </ScrollView>
  );
}

function TabButton({
  label,
  icon,
  active,
  onPress
}: {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabButton, active && styles.tabButtonActive]}
    >
      <Feather
        name={icon}
        size={16}
        color={active ? '#0B7A4D' : colors.textSecondary}
      />
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    paddingVertical: 16,
    paddingBottom: 120,
    gap: 12,
  },

  // Hero Card
  heroCard: {
    width: '100%',
    backgroundColor: '#0B7A4D',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    gap: 16,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },

  // Progress Section
  progressSection: {
    gap: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  progressBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },

  // Status Pills
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusPill: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusPillMuted: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0B7A4D',
  },
  statusPillMutedText: {
    color: 'rgba(255,255,255,0.9)',
  },

  // Tab Bar
  tabBar: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 6,
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#F0FDF4',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabButtonTextActive: {
    color: '#0B7A4D',
  },

  // Section Card
  sectionCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Form Section
  formSection: {
    gap: 14,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // Skills
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  skillChipGreen: {
    backgroundColor: '#ECFDF5',
    borderColor: '#D1FAE5',
  },
  skillChipYellow: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  skillChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
  },
  skillChipTextGreen: {
    color: '#10B981',
  },
  skillChipTextYellow: {
    color: '#F59E0B',
  },
  addSkillRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonGreen: {
    backgroundColor: '#10B981',
  },
  addButtonYellow: {
    backgroundColor: '#F59E0B',
  },

  // Empty State
  emptyState: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B7A4D',
  },

  // Save Button
  saveButton: {
    width: '100%',
    marginTop: 12,
  },

  // CV Upload Styles
  cvUploaded: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cvFileIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cvFileName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cvViewLink: {
    fontSize: 12,
    color: '#0B7A4D',
    marginTop: 2,
  },
  cvDeleteButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cvDropzone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  cvDropzoneDisabled: {
    opacity: 0.6,
  },
  cvDropzoneIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cvDropzoneText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cvDropzoneSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
