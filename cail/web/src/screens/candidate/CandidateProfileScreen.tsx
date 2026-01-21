import { useMemo, useState, useEffect } from 'react';
import {
  FiUser,
  FiTarget,
  FiEye,
  FiShield,
  FiBriefcase,
  FiAward,
  FiFileText,
  FiCode,
  FiHeart,
  FiStar,
  FiPlus,
  FiX,
  FiInbox,
  FiPlusCircle,
} from 'react-icons/fi';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import { CandidateProfileForm } from '../../types';
import { colors } from '../../theme/colors';
import { userService } from '../../services/user.service';
import { CvUploadDropzone } from '../../components/CvUploadDropzone';
import { useNotifications } from '../../components/ui/Notifications';
import { SkillSelector } from '../../components/ui/SkillSelector';
import { WorkExperience } from '../../types';
import { FiEdit2, FiTrash2, FiCheck } from 'react-icons/fi';

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
  const notifications = useNotifications();
  const [form, setForm] = useState<CandidateProfileForm>(emptyCandidateProfile);
  const [loading, setLoading] = useState(true);
  const [newSkill, setNewSkill] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');
  const [newCompetency, setNewCompetency] = useState('');
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'experience'>('personal');
  const [saving, setSaving] = useState(false);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [experienceModalVisible, setExperienceModalVisible] = useState(false);
  const [currentExperience, setCurrentExperience] = useState<Partial<WorkExperience>>({});

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
      window.alert('Completa los campos obligatorios (*)');
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
    if (window.confirm('¿Eliminar esta experiencia?')) {
      updateField(
        'workExperience',
        form.workExperience.filter((e) => e.id !== id)
      );
    }
  };

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
    } catch (error) {
      notifications.error('No se pudo cargar el perfil');
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
      form[key].filter((_, i) => i !== index)
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
          experienciaLaboral: form.workExperience,
          cedula: '',
        },
      });
      notifications.success('Tus cambios se guardaron correctamente.', 'Guardado');
    } catch (error: any) {
      notifications.error(error.message || 'No se pudieron guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ color: colors.textSecondary }}>Cargando perfil...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {/* Hero Card */}
      <div
        style={{
          background: '#0B7A4D',
          borderRadius: 16,
          padding: 20,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'grid',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.2)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <FiUser size={24} color="#FFFFFF" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 2 }}>
              Mi perfil profesional
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: '18px' }}>
              Administra tus datos personales y profesionales
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 999,
              background: '#ECFDF5',
              color: '#0B7A4D',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Perfil visible
          </span>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 999,
              background: '#F3F4F6',
              color: colors.textSecondary,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            ✓ Verificado
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, background: '#F3F4F6', padding: 6, borderRadius: 12 }}>
        {['personal', 'professional', 'experience'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab as typeof activeTab)}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: 10,
              border: 'none',
              background: activeTab === tab ? '#FFFFFF' : 'transparent',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {tab === 'personal' ? 'Datos personales' : tab === 'professional' ? 'Profesional' : 'Experiencia'}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'personal' && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #E5E7EB' }}>
          <InputField label="Nombre completo" value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} />
          <InputField label="Correo" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
          <InputField label="Teléfono" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
          <InputField label="Ciudad" value={form.city} onChange={(e) => updateField('city', e.target.value)} />
          <InputField label="Dirección" value={form.address} onChange={(e) => updateField('address', e.target.value)} />
        </div>
      )}

      {activeTab === 'professional' && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, color: '#4C5672', display: 'block', marginBottom: 6 }}>
              Resumen profesional
            </label>
            <textarea
              value={form.professionalSummary}
              onChange={(e) => updateField('professionalSummary', e.target.value)}
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '12px 14px',
                borderRadius: '18px',
                border: '1px solid #DFE7F5',
                fontSize: '15px',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>

          <SkillSelector
            selectedSkills={form.technicalSkills}
            onChange={(skills) => updateField('technicalSkills', skills)}
            label="Habilidades técnicas e informáticas"
            placeholder="Ej. React, Python, AWS..."
            chipVariant="gray"
            customChipBg="#EFF6FF"
            customChipText="#2563EB"
          />

          <SkillSelector
            selectedSkills={form.softSkills}
            onChange={(skills) => updateField('softSkills', skills)}
            label="Habilidades blandas y sociales"
            placeholder="Ej. Liderazgo, Comunicación..."
            chipVariant="gray"
            customChipBg="#ECFDF5"
            customChipText="#059669"
          />
        </div>
      )}

      {activeTab === 'experience' && (
        <div style={{ display: 'grid', gap: 16 }}>
          {/* Competencies */}
          <div style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #E5E7EB' }}>
            <SkillSelector
              selectedSkills={form.competencies}
              onChange={(skills) => updateField('competencies', skills)}
              label="Competencias Clave"
              placeholder="Ej. Gestión de proyectos, Análisis de datos..."
              chipVariant="gray"
              customChipBg="#FFFBEB"
              customChipText="#D97706"
            />
          </div>

          {/* Work Experience */}
          <div style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FiBriefcase size={20} color="#8B5CF6" />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>Experiencia laboral</div>
                  <div style={{ fontSize: 12, color: colors.textSecondary }}>Tus últimos cargos o prácticas</div>
                </div>
              </div>
              <button onClick={handleAddExperience} style={{ padding: 8, background: '#F3F4F6', borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiPlus size={18} color="#0B7A4D" />
              </button>
            </div>

            {form.workExperience.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, background: '#F9FAFB', borderRadius: 12, border: '1px dashed #E5E7EB', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <FiBriefcase size={32} color="#9CA3AF" style={{ marginBottom: 12 }} />
                <div style={{ fontWeight: 700, marginBottom: 4, color: '#374151' }}>Aún no registras experiencia</div>
                <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>Agrega tus experiencias para mejorar tus coincidencias</div>
                <button onClick={handleAddExperience} style={{ padding: '8px 16px', borderRadius: 8, background: '#fff', border: '1px solid #E5E7EB', color: '#0B7A4D', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiPlus size={16} /> Agregar experiencia
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {form.workExperience.map(exp => (
                  <div key={exp.id} style={{ padding: 16, background: '#F9FAFB', borderRadius: 12, border: '1px solid #F3F4F6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#111827' }}>{exp.company}</div>
                        <div style={{ color: '#3B82F6', fontWeight: 600, fontSize: 14 }}>{exp.position}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleEditExperience(exp)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}><FiEdit2 size={16} color="#6B7280" /></button>
                        <button onClick={() => handleDeleteExperience(exp.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}><FiTrash2 size={16} color="#DC2626" /></button>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 8px', fontWeight: 500 }}>
                      {exp.startDate} - {exp.isCurrent ? 'Actualidad' : exp.endDate}
                    </div>
                    {exp.description && (
                      <div style={{ fontSize: 13, color: '#4B5563', whiteSpace: 'pre-line', lineHeight: '1.5' }}>{exp.description}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CV Upload Section */}
          <div style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
              </svg>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>Curriculum Vitae</div>
                <div style={{ fontSize: 12, color: colors.textSecondary }}>Sube tu CV en formato PDF (máximo 5MB)</div>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiTarget size={16} color="#FFFFFF" />
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
                  Progreso del perfil
                </div>
              </div>
              <div
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '4px 10px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#FFFFFF',
                }}
              >
                {Math.round(completion * 100)}%
              </div>
            </div>
            <div
              style={{
                height: 8,
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: '#FFFFFF',
                  borderRadius: 4,
                  width: `${completion * 100}%`,
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>

          {/* Status Pills */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.9)',
                padding: '6px 10px',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <FiEye size={12} color="#0B7A4D" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#0B7A4D' }}>Perfil visible</span>
            </div>
            <div
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '6px 10px',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <FiShield size={12} color="rgba(255,255,255,0.9)" />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Verificado</span>
            </div>
          </div>
        </div>
      )}

      <Button label={saving ? 'Guardando...' : 'Guardar cambios'} onPress={handleSave} disabled={saving} fullWidth />

      {/* Modal */}
      {experienceModalVisible && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: 24,
            borderRadius: 16,
            width: '100%',
            maxWidth: 500,
            maxHeight: '90vh',
            overflowY: 'auto',
            display: 'grid',
            gap: 16,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1F2937' }}>
                {currentExperience.id ? 'Editar Experiencia' : 'Nueva Experiencia'}
              </div>
              <button onClick={() => setExperienceModalVisible(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <FiX size={24} color="#6B7280" />
              </button>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              <InputField
                label="Empresa *"
                value={currentExperience.company || ''}
                onChange={(e) => setCurrentExperience({ ...currentExperience, company: e.target.value })}
              />
              <InputField
                label="Cargo / Posición *"
                value={currentExperience.position || ''}
                onChange={(e) => setCurrentExperience({ ...currentExperience, position: e.target.value })}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4, display: 'block' }}>Fecha Inicio *</label>
                  <input
                    type="date"
                    value={currentExperience.startDate || ''}
                    onChange={(e) => setCurrentExperience({ ...currentExperience, startDate: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #D1D5DB' }}
                  />
                </div>
                {!currentExperience.isCurrent && (
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4, display: 'block' }}>Fecha Fin</label>
                    <input
                      type="date"
                      value={currentExperience.endDate || ''}
                      onChange={(e) => setCurrentExperience({ ...currentExperience, endDate: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: 8, border: '1px solid #D1D5DB' }}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>Actualmente trabajo aquí</div>
                <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
                  <input
                    type="checkbox"
                    checked={currentExperience.isCurrent || false}
                    onChange={(e) => {
                      setCurrentExperience({
                        ...currentExperience,
                        isCurrent: e.target.checked,
                        endDate: e.target.checked ? undefined : currentExperience.endDate
                      });
                    }}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: currentExperience.isCurrent ? '#10B981' : '#E5E7EB',
                    borderRadius: 34, transition: '.4s'
                  }}></span>
                  <span style={{
                    position: 'absolute', content: '""', height: 18, width: 18, left: 3, bottom: 3,
                    backgroundColor: 'white', borderRadius: '50%', transition: '.4s',
                    transform: currentExperience.isCurrent ? 'translateX(20px)' : 'none'
                  }}></span>
                </label>
              </div>

              <div>
                <label style={{ fontSize: 14, fontWeight: 600, color: '#4C5672', display: 'block', marginBottom: 6 }}>
                  Descripción / Logros
                </label>
                <textarea
                  value={currentExperience.description || ''}
                  onChange={(e) => setCurrentExperience({ ...currentExperience, description: e.target.value })}
                  style={{
                    width: '100%', minHeight: '100px', padding: '12px', borderRadius: '8px',
                    border: '1px solid #D1D5DB', fontFamily: 'inherit', resize: 'vertical'
                  }}
                  placeholder="Describe tus responsabilidades..."
                />
              </div>
            </div>

            <Button
              label="Guardar Experiencia"
              onPress={handleSaveExperience}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
