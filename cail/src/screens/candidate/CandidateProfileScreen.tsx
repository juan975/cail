import { useMemo, useState, useEffect } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator, Linking, Modal, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { InputField } from '@/components/ui/InputField';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { useResponsiveLayout } from '@/hooks/useResponsive';
import { CandidateProfileForm } from '@/types';
import { colors } from '@/theme/colors';
import { userService } from '@/services/user.service';
import { SkillSelector } from '@/components/ui/SkillSelector';
import * as DocumentPicker from 'expo-document-picker';
import { WorkExperience } from '@/types';

// Estado inicial vacío para el formulario
const emptyCandidateProfile: CandidateProfileForm = {
  fullName: '',
  email: '',
  phone: '',
  city: '',
  address: '',
  professionalSummary: '',
  technicalSkills: [],
  softSkills: [],
  competencies: [],
  workExperience: [],
};

export function CandidateProfileScreen() {
  const { contentWidth } = useResponsiveLayout();
  const [form, setForm] = useState<CandidateProfileForm>(emptyCandidateProfile);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'experience'>('personal');
  const [saving, setSaving] = useState(false);
  const [cvUrl, setCvUrl] = useState<string | null>(null);

  const [uploadingCv, setUploadingCv] = useState(false);
  const [experienceModalVisible, setExperienceModalVisible] = useState(false);
  const [currentExperience, setCurrentExperience] = useState<Partial<WorkExperience>>({});

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
          workExperience: (profile.candidateProfile.experienciaLaboral as any[]) || [],
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

  const handleAddExperience = () => {
    setCurrentExperience({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
    });
    setExperienceModalVisible(true);
  };

  const handleEditExperience = (exp: WorkExperience) => {
    setCurrentExperience({ ...exp });
    setExperienceModalVisible(true);
  };

  const handleSaveExperience = () => {
    if (!currentExperience.company || !currentExperience.position || !currentExperience.startDate) {
      Alert.alert('Error', 'Completa los campos obligatorios (*)');
      return;
    }

    const newExp = {
      ...currentExperience,
      id: currentExperience.id || Date.now().toString(),
    } as WorkExperience;

    if (currentExperience.id) {
      updateField(
        'workExperience',
        form.workExperience.map((e) => (e.id === newExp.id ? newExp : e))
      );
    } else {
      updateField('workExperience', [...form.workExperience, newExp]);
    }
    setExperienceModalVisible(false);
  };

  const handleDeleteExperience = (id: string) => {
    Alert.alert('Confirmar', '¿Eliminar esta experiencia?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          updateField(
            'workExperience',
            form.workExperience.filter((e) => e.id !== id)
          );
        },
      },
    ]);
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
          experienciaLaboral: form.workExperience,
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
              <SkillSelector
                selectedSkills={form.technicalSkills}
                onChange={(skills) => updateField('technicalSkills', skills)}
                label="Habilidades técnicas e informáticas"
                placeholder="Ej. React Native, Python, AWS..."
                chipColor="#3B82F6"
              />
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
              <SkillSelector
                selectedSkills={form.softSkills}
                onChange={(skills) => updateField('softSkills', skills)}
                label="Habilidades blandas y sociales"
                placeholder="Ej. Liderazgo, Comunicación, Trabajo en equipo..."
                chipColor="#10B981"
              />
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
              <SkillSelector
                selectedSkills={form.competencies}
                onChange={(skills) => updateField('competencies', skills)}
                label="Otras competencias clave"
                placeholder="Ej. Gestión de proyectos, Análisis de datos..."
                chipColor="#F59E0B"
              />
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

                    // En web, DocumentPicker devuelve un 'file' property que es un File real
                    // En móvil, necesitamos usar el objeto {uri, name, type}
                    if ((file as any).file) {
                      // Web: usar el File real
                      formData.append('cv', (file as any).file);
                    } else {
                      // Móvil: usar objeto con uri
                      formData.append('cv', {
                        uri: file.uri,
                        name: file.name,
                        type: 'application/pdf',
                      } as any);
                    }

                    const response = await userService.uploadCV(formData);
                    setCvUrl(response.cvUrl);
                    Alert.alert('Éxito', 'CV subido correctamente');
                  } catch (error: any) {
                    console.error('CV upload error:', error);
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
              <Pressable
                style={{ padding: 8, backgroundColor: '#F3F4F6', borderRadius: 8 }}
                onPress={handleAddExperience}
              >
                <Feather name="plus" size={18} color="#0B7A4D" />
              </Pressable>
            </View>

            {form.workExperience.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Feather name="inbox" size={32} color={colors.textSecondary} />
                </View>
                <Text style={styles.emptyTitle}>Aún no registras experiencia</Text>
                <Text style={styles.emptySubtitle}>
                  Agrega tus experiencias para mejorar tus coincidencias.
                </Text>
                <Pressable style={styles.emptyButton} onPress={handleAddExperience}>
                  <Feather name="plus-circle" size={18} color="#0B7A4D" />
                  <Text style={styles.emptyButtonText}>Agregar experiencia</Text>
                </Pressable>
              </View>
            ) : (
              form.workExperience.map((exp) => (
                <View key={exp.id} style={styles.experienceItem}>
                  <View style={styles.experienceHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.experienceCompany}>{exp.company}</Text>
                      <Text style={styles.experiencePosition}>{exp.position}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <Pressable
                        style={{ padding: 6 }}
                        onPress={() => handleEditExperience(exp)}
                      >
                        <Feather name="edit-2" size={16} color={colors.textSecondary} />
                      </Pressable>
                      <Pressable
                        style={{ padding: 6 }}
                        onPress={() => handleDeleteExperience(exp.id)}
                      >
                        <Feather name="trash-2" size={16} color="#DC2626" />
                      </Pressable>
                    </View>
                  </View>
                  <Text style={styles.experienceDate}>
                    {exp.startDate} - {exp.isCurrent ? 'Actualidad' : exp.endDate}
                  </Text>
                  {exp.description ? (
                    <Text style={styles.experienceDescription} numberOfLines={3}>
                      {exp.description}
                    </Text>
                  ) : null}
                </View>
              ))
            )}
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

      {/* Experience Modal */}
      <Modal
        visible={experienceModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setExperienceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.modalTitle}>
                {currentExperience.id ? 'Editar Experiencia' : 'Nueva Experiencia'}
              </Text>
              <Pressable onPress={() => setExperienceModalVisible(false)}>
                <Feather name="x" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ gap: 12 }}>
              <InputField
                label="Empresa *"
                value={currentExperience.company || ''}
                onChangeText={(text) =>
                  setCurrentExperience({ ...currentExperience, company: text })
                }
              />
              <InputField
                label="Cargo / Posición *"
                value={currentExperience.position || ''}
                onChangeText={(text) =>
                  setCurrentExperience({ ...currentExperience, position: text })
                }
              />

              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <InputField
                    label="Fecha Inicio (YYYY-MM-DD) *"
                    value={currentExperience.startDate || ''}
                    onChangeText={(text) => setCurrentExperience({ ...currentExperience, startDate: text })}
                    placeholder="2023-01-01"
                  />
                </View>
                {!currentExperience.isCurrent && (
                  <View style={{ flex: 1 }}>
                    <InputField
                      label="Fecha Fin (YYYY-MM-DD)"
                      value={currentExperience.endDate || ''}
                      onChangeText={(text) => setCurrentExperience({ ...currentExperience, endDate: text })}
                      placeholder="2024-01-01"
                    />
                  </View>
                )}
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
                <Text style={{ fontSize: 14, color: colors.textPrimary, fontWeight: '600' }}>Actualmente trabajo aquí</Text>
                <Switch
                  value={currentExperience.isCurrent || false}
                  onValueChange={(val) => {
                    setCurrentExperience({
                      ...currentExperience,
                      isCurrent: val,
                      endDate: val ? undefined : currentExperience.endDate
                    });
                  }}
                  trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                />
              </View>

              <InputField
                label="Descripción / Logros"
                value={currentExperience.description || ''}
                onChangeText={(text) =>
                  setCurrentExperience({ ...currentExperience, description: text })
                }
                multiline
                style={{ height: 100, textAlignVertical: 'top' }}
                placeholder="Describe tus responsabilidades y logros principales..."
              />
            </ScrollView>

            <Button
              label="Guardar Experiencia"
              onPress={handleSaveExperience}
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      </Modal>
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
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary
  },
  experienceItem: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 8,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  experienceCompany: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  experiencePosition: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginTop: 2,
  },
  experienceDate: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  experienceDescription: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    marginTop: 4,
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
