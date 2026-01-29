import { useState, useEffect } from 'react';
import { InputField } from '../../components/ui/InputField';
import { colors } from '../../theme/colors';
import { EmployerProfileForm } from '../../types';
import { userService } from '../../services/user.service';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useNotifications } from '../../components/ui/Notifications';

// Estado inicial vacío para el formulario
const emptyEmployerProfile: EmployerProfileForm = {
  companyName: '',
  commercialName: '',
  razonSocial: '',
  ruc: '',
  industry: '',
  companyType: '',
  numberOfEmployees: '',
  description: '',
  website: '',
  address: '',
  city: '',
  contactName: '',
  cargo: '',
  email: '',
  phone: '',
};

export function EmployerProfileScreen() {
  const [form, setForm] = useState<EmployerProfileForm>(emptyEmployerProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { success, error: showError } = useNotifications();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await userService.getProfile();

      if (profile.employerProfile) {
        const ep = profile.employerProfile as any;
        setForm({
          companyName: ep.nombreEmpresa || ep.razon_social || ep.razonSocial || ep.nombre_comercial || ep.nombreComercial || '',
          commercialName: ep.nombreComercial || ep.nombre_comercial || ep.nombreEmpresa || ep.razon_social || '',
          razonSocial: ep.razonSocial || ep.razon_social || ep.nombreEmpresa || '',
          ruc: ep.ruc || '',
          industry: ep.industry || ep.id_sector_industrial || ep.sector_industrial || '',
          companyType: ep.tipoEmpresa || ep.tipo_empresa || 'Privada',
          numberOfEmployees: ep.numberOfEmployees || ep.numero_colaboradores || '',
          description: ep.description || ep.descripcion || ep.resumen || '',
          website: ep.website || ep.sitioWeb || ep.sitio_web || '',
          address: ep.address || ep.direccion || '',
          city: ep.city || ep.ciudad || '',
          contactName: ep.nombreContacto || profile.nombreCompleto || '',
          cargo: ep.cargo || '',
          email: profile.email || '',
          phone: profile.telefono || ep.telefono || '',
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
          nombreComercial: form.commercialName,
          razonSocial: form.razonSocial,
          ruc: form.ruc,
          cargo: form.cargo,
          nombreContacto: form.contactName,
          industry: form.industry,
          tipoEmpresa: form.companyType,
          numberOfEmployees: form.numberOfEmployees,
          description: form.description,
          website: form.website,
          address: form.address,
          city: form.city,
        },
      });
      success('Perfil empresarial actualizado corectamente');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      showError('No se pudo guardar el perfil. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando perfil empresarial..." />;
  }

  return (
    <div style={{ display: 'grid', gap: 16, padding: '32px' }}>
      {/* Header with Glassmorphism and Badge */}
      <div
        style={{
          background: 'linear-gradient(135deg, #F1842D 0%, #EA580C 100%)',
          borderRadius: 16,
          padding: '20px',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          boxShadow: '0 4px 12px rgba(241, 132, 45, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', zIndex: 1 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.2)',
              display: 'grid',
              placeItems: 'center',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{form.commercialName || form.companyName || 'Perfil empresarial'}</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>{form.industry || 'Industria'} • {form.city || 'Ciudad'} • RUC: {form.ruc || 'N/A'}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', zIndex: 1 }}>
          <div 
            style={{ 
              background: 'rgba(209, 250, 229, 0.9)', 
              color: '#065F46', 
              padding: '6px 12px', 
              borderRadius: 999, 
              fontSize: 11, 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            VERIFICADA
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '10px 20px',
              borderRadius: 12,
              background: '#fff',
              color: '#EA580C',
              border: 'none',
              fontWeight: 700,
              fontSize: 14,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              }
            }}
          >
            {saving ? (
              <>
                <div style={{ animation: 'spin 1s linear infinite', border: '2px solid rgba(0,0,0,0.1)', borderTopColor: '#EA580C', borderRadius: '50%', width: 14, height: 14 }} />
                Guardando...
              </>
            ) : (
              <>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24 }}>
        
        {/* Left Column - Main Info */}
        <div style={{ gridColumn: 'span 8', display: 'grid', gap: 24 }}>
          
          {/* Company Identity Card */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ background: '#FFF7ED', color: '#F1842D', padding: 10, borderRadius: 12 }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Identidad Empresarial</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <InputField label="Nombre Comercial" value={form.commercialName} readonly onChange={(e) => updateField('commercialName', e.target.value)} />
              <InputField label="Razón Social" value={form.razonSocial} readonly onChange={(e) => updateField('razonSocial', e.target.value)} />
              <InputField label="RUC" value={form.ruc} readonly onChange={(e) => updateField('ruc', e.target.value)} />
              <InputField label="Tipo de Empresa" value={form.companyType} readonly onChange={(e) => updateField('companyType', e.target.value)} />
              <InputField label="Sector Industrial" value={form.industry} onChange={(e) => updateField('industry', e.target.value)} />
              <InputField label="Tamaño (Colaboradores)" value={form.numberOfEmployees} onChange={(e) => updateField('numberOfEmployees', e.target.value)} />
            </div>

            <div style={{ marginTop: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#4B5563', marginBottom: 8, display: 'block' }}>Descripción de la Empresa</label>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Cuenta la historia y misión de tu empresa..."
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 14,
                  border: '1px solid #E5E7EB',
                  fontSize: 14,
                  outline: 'none',
                  minHeight: 120,
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                  lineHeight: '1.5'
                }}
                onFocus={(e) => e.target.style.borderColor = '#F1842D'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>
          </div>

          {/* Location Card */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ background: '#EFF6FF', color: '#3B82F6', padding: 10, borderRadius: 12 }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Ubicación y Canales Digitales</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <InputField label="Ciudad" value={form.city} onChange={(e) => updateField('city', e.target.value)} />
              <InputField label="Sitio Web" value={form.website} onChange={(e) => updateField('website', e.target.value)} />
              <div style={{ gridColumn: 'span 2' }}>
                <InputField label="Dirección Principal" value={form.address} onChange={(e) => updateField('address', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Contact & Save */}
        <div style={{ gridColumn: 'span 4', display: 'grid', gap: 24, alignContent: 'start' }}>
          
          {/* Contact Person Card */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ background: '#ECFDF5', color: '#10B981', padding: 10, borderRadius: 12 }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Contacto Directo</h3>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <InputField label="Nombre de Contacto" value={form.contactName} onChange={(e) => updateField('contactName', e.target.value)} />
              <InputField label="Cargo / Posición" value={form.cargo} onChange={(e) => updateField('cargo', e.target.value)} />
              <InputField label="Correo Electrónico" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
              <InputField label="Teléfono / WhatsApp" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
