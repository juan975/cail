import { useMemo, useState, useEffect } from 'react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
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
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiMapPin,
  FiMail,
  FiPhone,
  FiMap,
  FiBookOpen,
  FiCalendar,
  FiActivity,
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

// Estado inicial vacío para el formulario
const emptyCandidateProfile: CandidateProfileForm = {
  fullName: '',
  email: '',
  cedula: '',
  phone: '',
  city: '',
  address: '',
  professionalSummary: '',
  educationLevel: '',
  degree: '',
  yearsExperience: '',
  experienceSummary: '',
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
          cedula: profile.candidateProfile.cedula || '',
          phone: profile.telefono || '',
          city: profile.candidateProfile.ciudad,
          address: profile.candidateProfile.direccion || '',
          professionalSummary: profile.candidateProfile.resumenProfesional || '',
          educationLevel: profile.candidateProfile.nivelEducacion || '',
          degree: profile.candidateProfile.titulo || '',
          yearsExperience: profile.candidateProfile.anosExperiencia || '',
          experienceSummary: profile.candidateProfile.resumenExperiencia || '',
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
          cedula: form.cedula,
          resumenProfesional: form.professionalSummary,
          nivelEducacion: form.educationLevel,
          titulo: form.degree,
          anosExperiencia: form.yearsExperience,
          resumenExperiencia: form.experienceSummary,
          habilidadesTecnicas: form.technicalSkills,
          softSkills: form.softSkills,
          competencias: form.competencies,
          experienciaLaboral: form.workExperience,
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
    return <LoadingSpinner message="Cargando perfil..." color="#0B7A4D" />;
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #0B7A4D 0%, #065F46 100%)',
          borderRadius: 20,
          padding: '24px',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          boxShadow: '0 8px 16px rgba(11, 122, 77, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', right: '-15px', top: '-15px', opacity: 0.1, color: '#fff' }}>
          <FiUser size={120} />
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center', zIndex: 1 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <FiUser size={26} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em' }}>{form.fullName || 'Mi Perfil Profesional'}</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>
              {form.degree || 'Candidato'} • {form.city || 'Ubicación'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, zIndex: 1 }}>
          <div style={statusPillStyle}>
            <FiEye size={14} /> Perfil Visible
          </div>
          <div 
            style={{ 
              ...statusPillStyle, 
              background: 'rgba(255,255,255,0.15)', 
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)' 
            }}
          >
            <FiShield size={14} /> Verificado
          </div>
        </div>
      </div>

      {/* Profile Metrics Card */}
      <div style={{ ...cardStyle, padding: '16px 20px', flexDirection: 'row', alignItems: 'center', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>Cualificación del Perfil</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#0B7A4D' }}>{Math.round(completion * 100)}%</span>
          </div>
          <div style={{ height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                background: 'linear-gradient(90deg, #1A936F, #0B7A4D)', 
                width: `${completion * 100}%`,
                transition: 'width 0.8s' 
              }} 
            />
          </div>
        </div>
        <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
          <FiEye size={16} color="#0B7A4D" />
          <p style={{ margin: 0, fontSize: 12, color: '#64748B', maxWidth: '280px' }}>
            Tu perfil es actualmente visible para todas las empresas verificadas en la plataforma.
          </p>
        </div>
      </div>

      {/* Tabs Design */}
      <div style={{ display: 'flex', gap: 12, background: '#F1F5F9', padding: '8px', borderRadius: '18px', maxWidth: '500px' }}>
        {[
          { id: 'personal', label: 'Personal', icon: <FiUser size={16} /> },
          { id: 'professional', label: 'Profesional', icon: <FiAward size={16} /> },
          { id: 'experience', label: 'Experiencia', icon: <FiBriefcase size={16} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '12px 16px',
              borderRadius: '14px',
              border: 'none',
              background: activeTab === tab.id ? '#fff' : 'transparent',
              color: activeTab === tab.id ? '#0B7A4D' : '#64748B',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 14,
              transition: 'all 0.2s',
              boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24 }}>
        {/* Main Column */}
        <div style={{ gridColumn: 'span 8', display: 'grid', gap: 24, alignContent: 'start' }}>
          
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div style={{ ...iconBadgeStyle, background: '#ECFDF5', color: '#10B981' }}>
                  <FiUser size={20} />
                </div>
                <h3 style={cardTitleStyle}>Datos de Identidad y Contacto</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <InputField 
                  label="Nombre Completo" 
                  value={form.fullName} 
                  onChange={(e) => updateField('fullName', e.target.value)}
                  icon={<FiUser size={16} color="#10B981" />}
                  tone="candidate"
                />
                <InputField 
                  label="Cédula / DNI" 
                  value={form.cedula} 
                  onChange={(e) => updateField('cedula', e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Ej. 11054..."
                  icon={<FiShield size={16} color="#10B981" />}
                  tone="candidate"
                  maxLength={10}
                />
                <InputField 
                  label="Correo Electrónico" 
                  value={form.email} 
                  readonly
                  icon={<FiMail size={16} color="#10B981" />}
                />
                <InputField 
                  label="Teléfono Móvil" 
                  value={form.phone} 
                  onChange={(e) => updateField('phone', e.target.value)}
                  icon={<FiPhone size={16} color="#10B981" />}
                  tone="candidate"
                />
                <InputField 
                  label="Ciudad de Residencia" 
                  value={form.city} 
                  onChange={(e) => updateField('city', e.target.value)}
                  icon={<FiMap size={16} color="#10B981" />}
                  tone="candidate"
                />
                <InputField 
                  label="Dirección Domiciliaria" 
                  value={form.address} 
                  onChange={(e) => updateField('address', e.target.value)}
                  icon={<FiMapPin size={16} color="#10B981" />}
                  tone="candidate"
                />
              </div>
            </div>
          )}

          {/* Professional Information Tab */}
          {activeTab === 'professional' && (
            <div style={{ display: 'grid', gap: 24 }}>
              {/* Summary & Education */}
              <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <div style={{ ...iconBadgeStyle, background: '#EEF2FF', color: '#6366F1' }}>
                    <FiBookOpen size={20} />
                  </div>
                  <h3 style={cardTitleStyle}>Formación y Resumen</h3>
                </div>
                <div style={{ display: 'grid', gap: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <InputField 
                      label="Nivel de Educación" 
                      value={form.educationLevel} 
                      onChange={(e) => updateField('educationLevel', e.target.value)}
                      placeholder="Ej. Universitario / Maestría"
                      icon={<FiBookOpen size={16} color="#6366F1" />}
                      tone="candidate"
                    />
                    <InputField 
                      label="Título Obtenido" 
                      value={form.degree} 
                      onChange={(e) => updateField('degree', e.target.value)}
                      placeholder="Ej. Ing. Civil"
                      icon={<FiAward size={16} color="#6366F1" />}
                      tone="candidate"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Resumen Profesional</label>
                    <textarea
                      value={form.professionalSummary}
                      onChange={(e) => updateField('professionalSummary', e.target.value)}
                      placeholder="Breve descripción de tu perfil, años de experiencia y objetivos..."
                      style={textAreaStyle}
                      onFocus={(e) => (e.target.style.borderColor = '#1A936F')}
                      onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
                    />
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <div style={{ ...iconBadgeStyle, background: '#F0FDF4', color: '#16A34A' }}>
                    <FiCode size={20} />
                  </div>
                  <h3 style={cardTitleStyle}>Habilidades y Aptitudes</h3>
                </div>
                <div style={{ display: 'grid', gap: 24 }}>
                  <SkillSelector
                    selectedSkills={form.technicalSkills}
                    onChange={(skills) => updateField('technicalSkills', skills)}
                    label="Tecnologías e Idiomas"
                    placeholder="Ej. Excel, Python, Inglés B2..."
                    chipVariant="gray"
                    customChipBg="#EFF6FF"
                    customChipText="#1E40AF"
                  />
                  <SkillSelector
                    selectedSkills={form.softSkills}
                    onChange={(skills) => updateField('softSkills', skills)}
                    label="Habilidades Blandas"
                    placeholder="Ej. Liderazgo, Empatía..."
                    chipVariant="gray"
                    customChipBg="#F0FDF4"
                    customChipText="#166534"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Experience Tab */}
          {activeTab === 'experience' && (
            <div style={{ display: 'grid', gap: 24 }}>
              {/* General Experience Metrics */}
              <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <div style={{ ...iconBadgeStyle, background: '#FFF7ED', color: '#EA580C' }}>
                    <FiActivity size={20} />
                  </div>
                  <h3 style={cardTitleStyle}>Trayectoria General</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
                  <InputField 
                    label="Años en el Sector" 
                    value={form.yearsExperience} 
                    onChange={(e) => updateField('yearsExperience', e.target.value)}
                    placeholder="Ej. 5 años"
                    icon={<FiCalendar size={16} color="#EA580C" />}
                    tone="candidate"
                  />
                  <div>
                    <label style={labelStyle}>Resumen de Experiencia</label>
                    <textarea 
                      value={form.experienceSummary}
                      onChange={(e) => updateField('experienceSummary', e.target.value)}
                      placeholder="Menciona tus roles más relevantes..."
                      style={{ ...textAreaStyle, minHeight: '80px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Detailed Experience List */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ ...iconBadgeStyle, background: '#F5F3FF', color: '#7C3AED' }}>
                      <FiBriefcase size={20} />
                    </div>
                    <h3 style={cardTitleStyle}>Historial Laboral</h3>
                  </div>
                  <button 
                    onClick={handleAddExperience} 
                    style={{ 
                      padding: '10px 16px', 
                      borderRadius: '12px', 
                      background: '#F3F4F6', 
                      border: 'none', 
                      color: '#0B7A4D', 
                      fontWeight: 700, 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#E5E7EB'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#F3F4F6'}
                  >
                    <FiPlus size={18} /> Agregar
                  </button>
                </div>

                {form.workExperience.length === 0 ? (
                  <div style={emptyStateStyle}>
                    <FiInbox size={48} color="#94A3B8" />
                    <p style={{ margin: '12px 0 4px', fontWeight: 700, color: '#475569' }}>Aún no has registrado experiencia</p>
                    <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>Agrega tus empleos anteriores para resaltar tu perfil.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 16 }}>
                    {form.workExperience.map(exp => (
                      <div key={exp.id} style={experienceItemStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: 800, color: '#1E293B', fontSize: 15 }}>{exp.company}</div>
                            <div style={{ color: '#0B7A4D', fontWeight: 700, fontSize: 13, marginTop: 2 }}>{exp.position}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => handleEditExperience(exp)} style={iconButtonStyle}><FiEdit2 size={14} color="#64748B" /></button>
                            <button onClick={() => handleDeleteExperience(exp.id)} style={iconButtonStyle}><FiTrash2 size={14} color="#EF4444" /></button>
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FiCalendar size={12} />
                          {exp.startDate} - {exp.isCurrent ? <span style={{ color: '#10B981', fontWeight: 700 }}>Actualidad</span> : exp.endDate}
                        </div>
                        {exp.description && (
                          <div style={{ fontSize: 13, color: '#475569', marginTop: 10, lineHeight: '1.5' }}>{exp.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar Column */}
        <div style={{ gridColumn: 'span 4', display: 'grid', gap: 24, alignContent: 'start' }}>
          
          {/* CV Section */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div style={{ ...iconBadgeStyle, background: '#FEF2F2', color: '#EF4444' }}>
                <FiFileText size={20} />
              </div>
              <h3 style={cardTitleStyle}>Currículum Vitae</h3>
            </div>
            <p style={{ fontSize: 13, color: '#64748B', margin: '-8px 0 16px', lineHeight: '1.4' }}>
              Sube tu hoja de vida para que los reclutadores puedan verla directamente.
            </p>
            <CvUploadDropzone 
              cvUrl={cvUrl} 
              uploading={uploadingCv}
              onUpload={async (file) => {
                setUploadingCv(true);
                try {
                  const formData = new FormData();
                  formData.append('cv', file);
                  const response = await userService.uploadCV(formData);
                  setCvUrl(response.cvUrl);
                  notifications.success('CV subido correctamente');
                } catch (error: any) {
                  notifications.error(error.message || 'Error al subir CV');
                } finally {
                  setUploadingCv(false);
                }
              }} 
              onDelete={async () => {
                setUploadingCv(true);
                try {
                  await userService.deleteCV();
                  setCvUrl(null);
                  notifications.success('CV eliminado');
                } catch (error: any) {
                  notifications.error(error.message || 'Error al eliminar CV');
                } finally {
                  setUploadingCv(false);
                }
              }} 
            />
          </div>

          {/* Competencies Widget */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div style={{ ...iconBadgeStyle, background: '#FFFBEB', color: '#D97706' }}>
                <FiStar size={20} />
              </div>
              <h3 style={cardTitleStyle}>Competencias</h3>
            </div>
            <SkillSelector
              selectedSkills={form.competencies}
              onChange={(skills) => updateField('competencies', skills)}
              label=""
              placeholder="Ej. Análisis, Resolución..."
              chipVariant="gray"
              customChipBg="#FFFBEB"
              customChipText="#B45309"
            />
          </div>

          {/* Action Box */}
            <div 
              style={{ 
                background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', 
                borderRadius: 20, 
                padding: '24px', 
                border: '1px solid #A7F3D0', 
              display: 'grid', 
              gap: 16,
              boxShadow: '0 10px 20px -5px rgba(11, 122, 77, 0.1)'
            }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ background: '#0B7A4D', color: '#fff', padding: 8, borderRadius: 10 }}>
                <FiCheck size={18} />
              </div>
              <p style={{ fontSize: 13, color: '#065F46', fontWeight: 700, margin: 0 }}>
                Tu perfil está optimizado para postulaciones.
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '16px',
                border: 'none',
                background: saving ? '#D1D5DB' : 'linear-gradient(135deg, #1A936F 0%, #0B7A4D 100%)',
                color: '#fff',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 800,
                fontSize: 16,
                boxShadow: saving ? 'none' : '0 8px 20px -4px rgba(11, 122, 77, 0.4)',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12
              }}
              onMouseEnter={(e) => { if (!saving) e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { if (!saving) e.currentTarget.style.transform = 'none'; }}
            >
              {saving ? 'Guardando...' : 'Aplicar Cambios'}
            </button>
          </div>
        </div>
      </div>

      {/* Experience Modal */}
      {experienceModalVisible && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{currentExperience.id ? 'Editar Experiencia' : 'Nueva Experiencia'}</h3>
              <button onClick={() => setExperienceModalVisible(false)} style={iconButtonStyle}><FiX size={24} /></button>
            </div>
            <div style={{ display: 'grid', gap: 16 }}>
              <InputField label="Empresa *" value={currentExperience.company || ''} onChange={(e) => setCurrentExperience({ ...currentExperience, company: e.target.value })} tone="candidate" />
              <InputField label="Cargo / Posición *" value={currentExperience.position || ''} onChange={(e) => setCurrentExperience({ ...currentExperience, position: e.target.value })} tone="candidate" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Fecha Inicio *</label>
                  <input type="date" value={currentExperience.startDate || ''} onChange={(e) => setCurrentExperience({ ...currentExperience, startDate: e.target.value })} style={inputDateStyle} />
                </div>
                {!currentExperience.isCurrent && (
                  <div>
                    <label style={labelStyle}>Fecha Fin</label>
                    <input type="date" value={currentExperience.endDate || ''} onChange={(e) => setCurrentExperience({ ...currentExperience, endDate: e.target.value })} style={inputDateStyle} />
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={labelStyle}>Actualmente trabajo aquí</span>
                <input type="checkbox" checked={currentExperience.isCurrent} onChange={(e) => setCurrentExperience({ ...currentExperience, isCurrent: e.target.checked })} style={{ width: 20, height: 20 }} />
              </div>
              <div>
                <label style={labelStyle}>Descripción de Funciones</label>
                <textarea 
                  value={currentExperience.description || ''} 
                  onChange={(e) => setCurrentExperience({ ...currentExperience, description: e.target.value })}
                  placeholder="Describe tus principales responsabilidades..."
                  style={textAreaStyle} 
                />
              </div>
              <Button label="Registrar Experiencia" onPress={handleSaveExperience} fullWidth />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Internal Styles
const statusPillStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: 999,
  background: '#fff',
  color: '#0B7A4D',
  fontSize: 12,
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  gap: 6
};

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 14,
  padding: '20px',
  border: '1px solid #E5E7EB',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  display: 'flex',
  flexDirection: 'column',
  gap: 16
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  marginBottom: 8
};

const cardTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '18px',
  fontWeight: 800,
  color: '#1E293B'
};

const iconBadgeStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 14,
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: '#475569',
  marginBottom: 8,
  display: 'block'
};

const textAreaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '120px',
  padding: '16px',
  borderRadius: '16px',
  border: '1px solid #E5E7EB',
  fontSize: '15px',
  fontFamily: 'inherit',
  resize: 'vertical',
  lineHeight: '1.6',
  background: '#F8FAFC',
  outline: 'none',
  boxSizing: 'border-box'
};

const emptyStateStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '40px 20px',
  background: '#F8FAFC',
  borderRadius: 20,
  border: '2px dashed #E2E8F0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

const experienceItemStyle: React.CSSProperties = {
  padding: '20px',
  background: '#F8FAFC',
  borderRadius: 20,
  border: '1px solid #F1F5F9'
};

const iconButtonStyle: React.CSSProperties = {
  padding: 8,
  borderRadius: 10,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  display: 'flex',
  transition: 'background 0.2s'
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(15, 23, 42, 0.45)',
  backdropFilter: 'blur(4px)',
  display: 'grid',
  placeItems: 'center',
  zIndex: 1000,
  padding: 24
};

const modalContentStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 20,
  padding: 24,
  width: '100%',
  maxWidth: '560px',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
};

const inputDateStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '14px',
  border: '1px solid #E2E8F0',
  fontSize: '14px',
  fontFamily: 'inherit',
  color: '#1E293B',
  background: '#fff',
  boxSizing: 'border-box'
};
