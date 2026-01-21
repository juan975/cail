import { useState } from 'react';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import { LoadingSplash } from '../../components/ui/LoadingSplash';
import { useNotifications } from '../../components/ui/Notifications';
import { authService } from '../../services/auth.service';

interface RegisterEmployerFormProps {
  onSuccess: (data: any) => void;
  onBack: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterEmployerForm({ onSuccess, onBack, onSwitchToLogin }: RegisterEmployerFormProps) {
  const notifications = useNotifications();
  const [empresaNombre, setEmpresaNombre] = useState('');
  const [cargo, setCargo] = useState('');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Loading and splash state
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [splashSuccess, setSplashSuccess] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);

  // Style helpers (updated without boxSizing)
  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    fontSize: '16px',
    color: '#111827',
    background: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.2s',
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '8px',
    display: 'block',
  };

  const textareaStyle = {
    width: '100%',
    padding: '14px 16px',
    fontSize: '16px',
    color: '#111827',
    background: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.2s',
    // No resize property needed
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#F59E0B';
    e.target.style.background = '#FFFFFF';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#E5E7EB';
    e.target.style.background = '#F9FAFB';
  };

  const handleSubmit = async () => {
    if (!empresaNombre || !cargo || !contacto || !telefono || !correo) {
      notifications.alert('Completa todos los campos del formulario.', 'Campos incompletos');
      return;
    }

    if (!acceptedTerms) {
      notifications.alert('Debes aceptar los términos y condiciones.', 'Requerido');
      return;
    }

    setLoading(true);
    setShowSplash(true);

    try {
      const response = await authService.register({
        email: correo,
        password: 'TempPassword123!',
        nombreCompleto: contacto,
        telefono,
        tipoUsuario: 'RECLUTADOR',
        employerData: {
          nombreEmpresa: empresaNombre,
          cargo,
          nombreContacto: contacto,
          direccion: address,
          ciudad: city,
          sitioWeb: website,
          descripcion: description,
        },
      });

      const userData = {
        id: response.idCuenta,
        company: empresaNombre,
        contactName: contacto,
        email: correo,
        needsPasswordChange: true,
        isEmailVerified: true,
      };

      setPendingData(userData);
      setSplashSuccess(true);
    } catch (error: any) {
      setLoading(false);
      setShowSplash(false);
      notifications.error(error.message || 'Error al crear la cuenta');
    }
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
    setSplashSuccess(false);
    setLoading(false);
    if (pendingData) {
      onSuccess(pendingData);
    }
  };

  return (
    <>
      <LoadingSplash visible={showSplash} success={splashSuccess} onComplete={handleSplashComplete} />

      <div style={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative',
      }}>
        {/* Back Button */}
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            top: '32px',
            left: '32px',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            border: 'none',
            background: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            e.currentTarget.style.transform = 'translateX(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <FiArrowLeft size={24} color="#374151" />
        </button>

        {/* Main Card */}
        <div style={{
          width: '100%',
          maxWidth: '600px',
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '48px 40px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
        }}>
          {/* Title */}
          <h1 style={{
            fontSize: '32px',
            fontWeight: 800,
            color: '#111827',
            marginBottom: '8px',
            letterSpacing: '-0.5px',
          }}>
            Registro de Empresa
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6B7280',
            marginBottom: '32px',
          }}>
            Crea tu cuenta de empleador
          </p>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Company Name */}
            <div>
              <label style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px',
                display: 'block',
              }}>
                Nombre de la empresa *
              </label>
              <input
                type="text"
                value={empresaNombre}
                onChange={(e) => setEmpresaNombre(e.target.value)}
                placeholder="Ej: CAFRILOSA"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  color: '#111827',
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#F59E0B';
                  e.target.style.background = '#FFFFFF';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.background = '#F9FAFB';
                }}
              />
            </div>

            {/* Position */}
            <div>
              <label style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px',
                display: 'block',
              }}>
                Cargo responsable *
              </label>
              <input
                type="text"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Ej: Gerente de Recursos Humanos"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  color: '#111827',
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#F59E0B';
                  e.target.style.background = '#FFFFFF';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.background = '#F9FAFB';
                }}
              />
            </div>

            {/* Contact Name */}
            <div>
              <label style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px',
                display: 'block',
              }}>
                Nombre del contacto *
              </label>
              <input
                type="text"
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
                placeholder="Nombre completo del responsable"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  color: '#111827',
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#F59E0B';
                  e.target.style.background = '#FFFFFF';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.background = '#F9FAFB';
                }}
              />
            </div>

            {/* Phone */}
            <div>
              <label style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px',
                display: 'block',
              }}>
                Teléfono *
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="07-XXXXXXX"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  color: '#111827',
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#F59E0B';
                  e.target.style.background = '#FFFFFF';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.background = '#F9FAFB';
                }}
              />
            </div>

                {/* Email */}
                <div>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '8px',
                    display: 'block',
                  }}>
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="tu@email.com"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>

                {/* Address */}
                <div>
                  <label style={labelStyle}>Dirección *</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Calle principal 123"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>

                {/* City */}
                <div>
                  <label style={labelStyle}>Ciudad *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Loja"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>

                {/* Website */}
                <div>
                  <label style={labelStyle}>Sitio web</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://empresa.com"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={labelStyle}>Descripción de la empresa</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Breve descripción..."
                    rows={4}
                    style={textareaStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>

            {/* Terms and Conditions */}
            <div style={{
              padding: '16px',
              background: '#FFFBEB',
              borderRadius: '12px',
              border: '1px solid #FDE68A',
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    marginTop: '2px',
                    cursor: 'pointer',
                    accentColor: '#F59E0B',
                  }}
                />
                <span style={{
                  fontSize: '14px',
                  color: '#374151',
                  lineHeight: '1.5',
                  flex: 1,
                }}>
                  Acepto los{' '}
                  <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        notifications.info('Términos y condiciones - Próximamente');
                      }}
                      style={{
                        color: '#F59E0B',
                        fontWeight: 600,
                      textDecoration: 'underline',
                    }}
                  >
                    términos y condiciones
                  </a>
                  {' '}de uso de la plataforma
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '12px',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(245, 158, 11, 0.4)';
              }}
            >
              {loading ? 'Registrando empresa...' : 'Registrar empresa'}
              {!loading && <FiCheck size={20} />}
            </button>
          </div>

          {/* Login Link */}
          <div style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#6B7280',
          }}>
            ¿Ya tienes cuenta?{' '}
            <button
              onClick={onSwitchToLogin}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#F59E0B',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Inicia sesión
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
