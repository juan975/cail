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
import { CandidateProfileForm } from '../../types';
import { initialCandidateProfile } from '../../data/mockData';
import { colors } from '../../theme/colors';
import { userService } from '../../services/user.service';
import { CvUploadDropzone } from '../../components/CvUploadDropzone';
import { useNotifications } from '../../components/ui/Notifications';

export function CandidateProfileScreen() {
  const notifications = useNotifications();
  const [form, setForm] = useState<CandidateProfileForm>(initialCandidateProfile);
  const [loading, setLoading] = useState(true);
  const [newSkill, setNewSkill] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');
  const [newCompetency, setNewCompetency] = useState('');
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'experience'>('personal');
  const [saving, setSaving] = useState(false);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [uploadingCv, setUploadingCv] = useState(false);

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

        {/* Tab Bar */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 12,
            padding: 6,
            display: 'flex',
            gap: 6,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '10px 8px',
              borderRadius: 8,
              border: 'none',
              background: activeTab === 'personal' ? '#F0FDF4' : 'transparent',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              color: activeTab === 'personal' ? '#0B7A4D' : colors.textSecondary,
            }}
          >
            <FiUser size={16} />
            Personal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('professional')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '10px 8px',
              borderRadius: 8,
              border: 'none',
              background: activeTab === 'professional' ? '#F0FDF4' : 'transparent',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              color: activeTab === 'professional' ? '#0B7A4D' : colors.textSecondary,
            }}
          >
            <FiBriefcase size={16} />
            Profesional
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('experience')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '10px 8px',
              borderRadius: 8,
              border: 'none',
              background: activeTab === 'experience' ? '#F0FDF4' : 'transparent',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              color: activeTab === 'experience' ? '#0B7A4D' : colors.textSecondary,
            }}
          >
            <FiAward size={16} />
            Experiencia
          </button>
        </div>

        {/* Personal Tab */}
        {activeTab === 'personal' && (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 12,
              padding: 16,
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <FiUser size={20} color="#0B7A4D" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>Información personal</div>
                <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                  Esta información es visible para los empleadores
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Nombre completo</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  style={{
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: 10,
                    padding: '12px 14px',
                    fontSize: 14,
                    color: '#1F2937',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                  Correo electrónico
                  <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 8 }}>SOLO LECTURA</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  readOnly
                  style={{
                    background: '#F3F4F6',
                    border: '1px solid #E5E7EB',
                    borderRadius: 10,
                    padding: '12px 14px',
                    fontSize: 14,
                    color: '#6B7280',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Teléfono</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  style={{
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: 10,
                    padding: '12px 14px',
                    fontSize: 14,
                    color: '#1F2937',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Ciudad</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  style={{
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: 10,
                    padding: '12px 14px',
                    fontSize: 14,
                    color: '#1F2937',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Dirección completa</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  style={{
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: 10,
                    padding: '12px 14px',
                    fontSize: 14,
                    color: '#1F2937',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Professional Tab */}
        {activeTab === 'professional' && (
          <>
            {/* Professional Summary */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 12,
                padding: 16,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <FiFileText size={20} color="#0B7A4D" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>Resumen profesional</div>
                  <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                    Describe tu perfil y rol objetivo
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Resumen</label>
                <textarea
                  value={form.professionalSummary}
                  onChange={(e) => updateField('professionalSummary', e.target.value)}
                  placeholder="Ej. Ingeniero con 5 años de experiencia en desarrollo de aplicaciones móviles..."
                  rows={4}
                  style={{
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: 10,
                    padding: '12px 14px',
                    fontSize: 14,
                    color: '#1F2937',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>

            {/* Technical Skills */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 12,
                padding: 16,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <FiCode size={20} color="#3B82F6" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>Habilidades técnicas</div>
                  <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                    Agrega tecnologías o certificaciones clave
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 14 }}>
                {form.technicalSkills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {form.technicalSkills.map((skill, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          background: '#EFF6FF',
                          border: '1px solid #DBEAFE',
                          padding: '6px 10px',
                          borderRadius: 8,
                        }}
                      >
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#3B82F6' }}>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeItem('technicalSkills', index)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <FiX size={14} color="#3B82F6" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Ej. React Native, Python, AWS..."
                    style={{
                      flex: 1,
                      background: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: 10,
                      padding: '12px 14px',
                      fontSize: 14,
                      color: '#1F2937',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addItem('technicalSkills', newSkill);
                      setNewSkill('');
                    }}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: '#3B82F6',
                      border: 'none',
                      display: 'grid',
                      placeItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <FiPlus size={20} color="#FFFFFF" />
                  </button>
                </div>
              </div>
            </div>

            {/* Soft Skills */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 12,
                padding: 16,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <FiHeart size={20} color="#10B981" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>Habilidades blandas</div>
                  <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                    Fortalezas personales y sociales
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 14 }}>
                {form.softSkills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {form.softSkills.map((skill, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          background: '#D1FAE5',
                          border: '1px solid #A7F3D0',
                          padding: '6px 10px',
                          borderRadius: 8,
                        }}
                      >
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#10B981' }}>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeItem('softSkills', index)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <FiX size={14} color="#10B981" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={newSoftSkill}
                    onChange={(e) => setNewSoftSkill(e.target.value)}
                    placeholder="Ej. Liderazgo, Comunicación..."
                    style={{
                      flex: 1,
                      background: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: 10,
                      padding: '12px 14px',
                      fontSize: 14,
                      color: '#1F2937',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addItem('softSkills', newSoftSkill);
                      setNewSoftSkill('');
                    }}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: '#10B981',
                      border: 'none',
                      display: 'grid',
                      placeItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <FiPlus size={20} color="#FFFFFF" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Experience Tab */}
        {activeTab === 'experience' && (
          <>
            {/* Competencies */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 12,
                padding: 16,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <FiStar size={20} color="#F59E0B" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>Competencias</div>
                  <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                    Selecciona tus competencias clave
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 14 }}>
                {form.competencies.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {form.competencies.map((skill, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          background: '#FEF3C7',
                          border: '1px solid #FDE68A',
                          padding: '6px 10px',
                          borderRadius: 8,
                        }}
                      >
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#F59E0B' }}>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeItem('competencies', index)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <FiX size={14} color="#F59E0B" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={newCompetency}
                    onChange={(e) => setNewCompetency(e.target.value)}
                    placeholder="Ej. Gestión de proyectos, Análisis de datos..."
                    style={{
                      flex: 1,
                      background: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: 10,
                      padding: '12px 14px',
                      fontSize: 14,
                      color: '#1F2937',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addItem('competencies', newCompetency);
                      setNewCompetency('');
                    }}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: '#F59E0B',
                      border: 'none',
                      display: 'grid',
                      placeItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <FiPlus size={20} color="#FFFFFF" />
                  </button>
                </div>
              </div>
            </div>

            {/* CV Upload Section */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 12,
                padding: 16,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <FiFileText size={20} color="#DC2626" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>Curriculum Vitae</div>
                  <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                    Sube tu CV en formato PDF (máximo 5MB)
                  </div>
                </div>
              </div>
              <CvUploadDropzone
                cvUrl={cvUrl}
                onUpload={async (file) => {
                  setUploadingCv(true);
                  try {
                    const formData = new FormData();
                    formData.append('cv', file);
                    const result = await userService.uploadCV(formData);
                    setCvUrl(result.cvUrl);
                    notifications.success('CV subido correctamente', 'Curriculum Vitae');
                  } catch (error: any) {
                    notifications.error(error.message || 'Error al subir el CV');
                  } finally {
                    setUploadingCv(false);
                  }
                }}
                onDelete={async () => {
                  setUploadingCv(true);
                  try {
                    await userService.deleteCV();
                    setCvUrl(null);
                    notifications.success('CV eliminado correctamente', 'Curriculum Vitae');
                  } catch (error: any) {
                    notifications.error(error.message || 'Error al eliminar el CV');
                  } finally {
                    setUploadingCv(false);
                  }
                }}
                uploading={uploadingCv}
              />
            </div>

            {/* Work Experience */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 12,
                padding: 16,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <FiBriefcase size={20} color="#8B5CF6" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>Experiencia laboral</div>
                  <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                    Registra tus últimos cargos o prácticas
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    background: '#F3F4F6',
                    display: 'grid',
                    placeItems: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <FiInbox size={32} color={colors.textSecondary} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: colors.textPrimary, marginBottom: 8 }}>
                  Aún no registras experiencia
                </div>
                <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 16, lineHeight: '20px' }}>
                  Agrega tus experiencias para mejorar tus coincidencias con ofertas laborales.
                </div>
                <button
                  type="button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'transparent',
                    border: '1px solid #0B7A4D',
                    borderRadius: 10,
                    padding: '10px 16px',
                    color: '#0B7A4D',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <FiPlusCircle size={18} />
                  Agregar experiencia
                </button>
              </div>
            </div>
          </>
        )}

        {/* Save Button */}
        <Button
          label={saving ? 'Guardando...' : 'Guardar cambios'}
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          fullWidth
        />
      </div>
  );
}
