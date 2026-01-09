import { useState, useEffect } from 'react';
import { FiBriefcase, FiHome, FiMapPin, FiUsers } from 'react-icons/fi';
import { InputField } from '../../components/ui/InputField';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Button } from '../../components/ui/Button';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import { EmployerProfileForm } from '../../types';
import { initialEmployerProfile } from '../../data/mockData';
import { colors } from '../../theme/colors';
import { userService } from '../../services/user.service';

export function EmployerProfileScreen() {
  const { contentWidth } = useResponsiveLayout();
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
      window.alert('No se pudo cargar el perfil');
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
      window.alert('Perfil actualizado correctamente');
    } catch (error: any) {
      window.alert(error.message || 'No se pudieron guardar los cambios');
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
    <div style={{ display: 'grid', gap: 16, maxWidth: contentWidth, margin: '0 auto' }}>
      <div
        style={{
          background: '#FFF7ED',
          borderRadius: 18,
          padding: 20,
          border: '1px solid #FDE68A',
          display: 'grid',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#FFF1DA',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <FiHome size={18} color={colors.employerDark} />
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>Identidad empresarial al día</div>
            <div style={{ fontSize: 13, color: colors.textSecondary }}>
              Mantén tus datos consistentes para generar confianza.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: '#FFF1DA', color: colors.employerDark, fontSize: 12 }}>
            <FiBriefcase size={12} /> {form.industry || 'Industria'}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: '#FFF1DA', color: colors.employerDark, fontSize: 12 }}>
            <FiUsers size={12} /> {form.numberOfEmployees || 'Colaboradores'}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: '#FFF1DA', color: colors.employerDark, fontSize: 12 }}>
            <FiMapPin size={12} /> {form.address || 'Ubicación'}
          </span>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 18, padding: 20, border: '1px solid #E5E7EB' }}>
        <SectionHeader title="Perfil empresarial" subtitle="Información visible para candidatos" />
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
          <InputField
            label="Descripción"
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            multiline
          />
        </div>
        <div style={{ marginTop: 16 }}>
          <Button label={saving ? 'Guardando...' : 'Guardar cambios'} onPress={handleSave} disabled={saving} tone="employer" fullWidth />
        </div>
      </div>
    </div>
  );
}
