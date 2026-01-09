import { useMemo, useState, useEffect } from 'react';
import { InputField } from '../../components/ui/InputField';
import { Button } from '../../components/ui/Button';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import { CandidateProfileForm } from '../../types';
import { initialCandidateProfile } from '../../data/mockData';
import { colors } from '../../theme/colors';
import { userService } from '../../services/user.service';

export function CandidateProfileScreen() {
  const { contentWidth } = useResponsiveLayout();
  const [form, setForm] = useState<CandidateProfileForm>(initialCandidateProfile);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'experience'>('personal');
  const [saving, setSaving] = useState(false);

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
          softSkills: [],
          competencies: profile.candidateProfile.competencias || [],
        });
      }
    } catch (error) {
      window.alert('No se pudo cargar el perfil');
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
          competencias: form.competencies,
          cedula: '',
        },
      });
      window.alert('Tus cambios se guardaron correctamente.');
    } catch (error: any) {
      window.alert(error.message || 'No se pudieron guardar los cambios');
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
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Header */}
      <div
        style={{
          background: '#0B7A4D',
          borderRadius: 16,
          padding: 20,
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Mi perfil profesional</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>Administra tus datos personales y profesionales</div>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 13 }}>🎯 Progreso del perfil</div>
            <div style={{ fontWeight: 700 }}>{Math.round(completion * 100)}%</div>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 999, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                background: '#FFFFFF',
                width: `${completion * 100}%`,
                transition: 'width 0.3s',
              }}
            />
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
            👁️ Perfil visible
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
        <div style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #E5E7EB' }}>
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
      )}

      {activeTab === 'experience' && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 14, color: colors.textSecondary }}>
            Sección de experiencia en desarrollo
          </div>
        </div>
      )}

      <Button label={saving ? 'Guardando...' : 'Guardar cambios'} onPress={handleSave} disabled={saving} fullWidth />
    </div>
  );
}
