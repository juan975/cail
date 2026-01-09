import { useState, useEffect } from 'react';
import { InputField } from '../../components/ui/InputField';
import { colors } from '../../theme/colors';
import { EmployerProfileForm } from '../../types';
import { initialEmployerProfile } from '../../data/mockData';
import { userService } from '../../services/user.service';

export function EmployerProfileScreen() {
  const [form, setForm] = useState<EmployerProfileForm>(initialEmployerProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await userService.getProfile();

      if (profile.employerProfile) {
        setForm({
          companyName: profile.employerProfile.nombreEmpresa || '',
          contactName: profile.employerProfile.nombreContacto || '',
          email: profile.email,
          phone: profile.telefono || '',
          industry: profile.employerProfile.industry || '',
          numberOfEmployees: profile.employerProfile.numberOfEmployees || '',
          description: profile.employerProfile.description || '',
          website: profile.employerProfile.website || '',
          address: profile.employerProfile.address || '',
        });
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key: keyof EmployerProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await userService.updateProfile({
        nombreCompleto: form.contactName,
        telefono: form.phone,
        employerProfile: {
          nombreEmpresa: form.companyName,
          cargo: '',
          nombreContacto: form.contactName,
          industry: form.industry,
          numberOfEmployees: form.numberOfEmployees,
          description: form.description,
          website: form.website,
          address: form.address,
        },
      });
    } catch (error: any) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ color: colors.textSecondary }}>Cargando perfil...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 16, padding: '32px' }}>
      {/* Header */}
      <div
        style={{
          background: '#F1842D',
          borderRadius: 16,
          padding: 20,
          color: '#fff',
          display: 'flex',
          gap: 16,
          alignItems: 'center',
        }}
      >
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
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Perfil empresarial</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>Mantén tus datos actualizados para generar confianza</div>
        </div>
      </div>

      {/* Info Banner */}
      <div
        style={{
          background: '#FFF7ED',
          borderRadius: 14,
          padding: 14,
          border: '1px solid #FDE68A',
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
        }}
      >

        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Identidad empresarial al día</div>
          <div style={{ fontSize: 13, color: colors.textSecondary }}>
            Mantén tus datos consistentes para generar confianza con los candidatos
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            <span
              style={{
                padding: '4px 8px',
                borderRadius: 999,
                background: '#FFF1DA',
                color: '#EA580C',
                fontSize: 11,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {form.industry || 'Industria'}
            </span>
            <span
              style={{
                padding: '4px 8px',
                borderRadius: 999,
                background: '#FFF1DA',
                color: '#EA580C',
                fontSize: 11,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {form.numberOfEmployees || 'Colaboradores'}
            </span>
            <span
              style={{
                padding: '4px 8px',
                borderRadius: 999,
                background: '#FFF1DA',
                color: '#EA580C',
                fontSize: 11,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {form.address || 'Ubicación'}
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #E5E7EB' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Información de la empresa</div>
          <div style={{ fontSize: 13, color: colors.textSecondary }}>Información visible para candidatos</div>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          <InputField label="Razón social" value={form.companyName} onChange={(e) => updateField('companyName', e.target.value)} />
          <InputField label="Industria" value={form.industry} onChange={(e) => updateField('industry', e.target.value)} />
          <InputField
            label="Número de colaboradores"
            value={form.numberOfEmployees}
            onChange={(e) => updateField('numberOfEmployees', e.target.value)}
          />
          <InputField label="Nombre de contacto" value={form.contactName} onChange={(e) => updateField('contactName', e.target.value)} />
          <InputField label="Correo" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
          <InputField label="Teléfono" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
          <InputField label="Sitio web" value={form.website} onChange={(e) => updateField('website', e.target.value)} />
          <InputField label="Dirección" value={form.address} onChange={(e) => updateField('address', e.target.value)} />
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block' }}>Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 12,
                border: '1px solid #E5E7EB',
                fontSize: 14,
                outline: 'none',
                minHeight: '100px',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 12,
              border: 'none',
              background: saving ? '#9CA3AF' : '#F1842D',
              color: '#fff',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: 600,
            }}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
