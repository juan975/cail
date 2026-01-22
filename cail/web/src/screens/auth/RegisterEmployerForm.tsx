import { useState, useEffect } from 'react';
import { FiArrowLeft, FiCheck, FiChevronDown } from 'react-icons/fi';
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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Company selection state
  const [companies, setCompanies] = useState<any[]>([]);
  const [ruc, setRuc] = useState('');
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const selectedCompany = companies.find(c => c.ruc === ruc);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoadingCompanies(true);
        const data = await authService.getCompanies();
        setCompanies(data);
      } catch (error) {
        console.error('Error fetching companies:', error);
        notifications.error('No se pudieron cargar las empresas.');
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, []);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRuc = e.target.value;
    setRuc(selectedRuc);
    const company = companies.find(c => c.ruc === selectedRuc);
    if (company) {
      setEmpresaNombre(company.razonSocial);
      setAddress(company.direccion || '');
      setCity(company.ciudad || '');
      setWebsite(company.website || '');
      setDescription(company.descripcion || '');
    } else {
      setEmpresaNombre('');
      setAddress('');
      setCity('');
      setWebsite('');
      setDescription('');
    }
  };

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
    if (!empresaNombre || !cargo || !contacto || !telefono || !correo || !password) {
      notifications.alert('Completa todos los campos del formulario.', 'Campos incompletos');
      return;
    }

    if (password.length < 6) {
      notifications.alert('La contraseña debe tener al menos 6 caracteres.', 'Contraseña muy corta');
      return;
    }

    if (password !== confirmPassword) {
      notifications.alert('Las contraseñas no coinciden.', 'Error de contraseña');
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
        password: password,
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
          ruc: ruc, // Include RUC for backend validation
        },
      });

      const userData = {
        id: response.idCuenta,
        company: empresaNombre,
        contactName: contacto,
        email: correo,
        needsPasswordChange: false, // User already set their password during registration
        isEmailVerified: false, // Email needs verification by supervisor
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
            <div style={{ position: 'relative' }}>
              <label style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px',
                display: 'block',
              }}>
                Nombre de la empresa *
              </label>
              <select
                value={ruc}
                onChange={handleCompanyChange}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  paddingRight: '40px',
                  fontSize: '16px',
                  color: '#111827',
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  appearance: 'none',
                  cursor: 'pointer',
                }}
                disabled={loadingCompanies}
              >
                <option value="">Selecciona tu empresa</option>
                {companies.map((company) => (
                  <option key={company.ruc} value={company.ruc}>
                    {company.razonSocial}
                  </option>
                ))}
              </select>
              <FiChevronDown
                size={20}
                color="#9CA3AF"
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '42px', // Adjusted for label height + padding
                  pointerEvents: 'none',
                }}
              />
              {loadingCompanies && <span style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px', display: 'block' }}>Cargando empresas...</span>}
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

            {/* Password */}
            <div>
              <label style={labelStyle}>Contraseña *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label style={labelStyle}>Confirmar contraseña *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
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
                disabled={!!selectedCompany?.direccion} // Disabled ONLY if DB provided data
                placeholder="Calle principal 123"
                style={{
                  ...inputStyle,
                  background: (!!selectedCompany?.direccion) ? '#E5E7EB' : '#F9FAFB', // Darker grey for disabled
                  cursor: (!!selectedCompany?.direccion) ? 'not-allowed' : 'text',
                  opacity: (!!selectedCompany?.direccion) ? 0.7 : 1,
                }}
              />
            </div>

            {/* City */}
            <div>
              <label style={labelStyle}>Ciudad *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={!!selectedCompany?.ciudad}
                placeholder="Loja"
                style={{
                  ...inputStyle,
                  background: (!!selectedCompany?.ciudad) ? '#E5E7EB' : '#F9FAFB',
                  cursor: (!!selectedCompany?.ciudad) ? 'not-allowed' : 'text',
                  opacity: (!!selectedCompany?.ciudad) ? 0.7 : 1,
                }}
              />
            </div>

            {/* Website */}
            <div>
              <label style={labelStyle}>Sitio web</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                disabled={!!selectedCompany?.website}
                placeholder="https://empresa.com"
                style={{
                  ...inputStyle,
                  background: (!!selectedCompany?.website) ? '#E5E7EB' : '#F9FAFB',
                  cursor: (!!selectedCompany?.website) ? 'not-allowed' : 'text',
                  opacity: (!!selectedCompany?.website) ? 0.7 : 1,
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>Descripción de la empresa</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!!selectedCompany?.descripcion}
                placeholder="Breve descripción..."
                rows={4}
                style={{
                  ...textareaStyle,
                  background: (!!selectedCompany?.descripcion) ? '#E5E7EB' : '#F9FAFB',
                  cursor: (!!selectedCompany?.descripcion) ? 'not-allowed' : 'text',
                  opacity: (!!selectedCompany?.descripcion) ? 0.7 : 1,
                }}
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
