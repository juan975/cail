import { useState, useEffect } from 'react';
import logo from '../../assets/logo.png';
import { FiArrowLeft, FiCheck, FiChevronDown, FiEye, FiEyeOff } from 'react-icons/fi';
import { LoadingSplash } from '../../components/ui/LoadingSplash';
import { useNotifications } from '../../components/ui/Notifications';
import { authService } from '../../services/auth.service';
import { PasswordStrength, validatePassword } from '../../components/ui/PasswordStrength';
import { TermsModal } from '../../components/legal/TermsModal';

// Styles
const screenContainerStyle: React.CSSProperties = {
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px 20px',
  position: 'relative',
};

const backButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: '40px',
  left: '40px',
  width: '60px',
  height: '60px',
  borderRadius: '20px',
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  zIndex: 10,
};

const glassCardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '680px',
  background: 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(20px)',
  borderRadius: '40px',
  padding: '64px 56px',
  boxShadow: '0 50px 100px rgba(0,0,0,0.18)',
  zIndex: 5,
};

const labelStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 800,
  color: '#334155',
  marginBottom: '10px',
  display: 'block',
  marginLeft: '4px'
};

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

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
    padding: '16px 18px',
    fontSize: '16px',
    color: '#0F172A',
    background: '#F1F5F9',
    border: '2px solid transparent',
    borderRadius: '16px',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box' as const,
    fontWeight: 500,
  };

  const textareaStyle = {
    ...inputStyle,
    height: '120px',
    resize: 'none' as const,
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = `rgba(245, 158, 11, 0.4)`;
    e.target.style.background = '#FFFFFF';
    e.target.style.boxShadow = `0 0 0 5px rgba(245, 158, 11, 0.1)`;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'transparent';
    e.target.style.background = '#F1F5F9';
    e.target.style.boxShadow = 'none';
  };

  useEffect(() => {
    document.title = 'CAIL | Registro de Empleador';
  }, []);

  const handleSubmit = async () => {
    if (!empresaNombre || !cargo || !contacto || !telefono || !correo || !password) {
      notifications.alert('Completa todos los campos del formulario.', 'Campos incompletos');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      notifications.alert(passwordValidation.errors[0], 'Contraseña inválida');
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

      <div style={{ ...screenContainerStyle, background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)' }}>
        <button
          onClick={onBack}
          style={backButtonStyle}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
        >
          <FiArrowLeft size={28} color="#FFFFFF" />
        </button>

        <div style={glassCardStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <div style={formLogoContainerStyle}>
              <img src={logo} alt="Logo" style={{ width: '100%', height: 'auto' }} />
            </div>
          </div>
          
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
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    ...inputStyle,
                    paddingRight: '48px',
                    boxSizing: 'border-box'
                  }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <FiEyeOff size={20} color="#9CA3AF" /> : <FiEye size={20} color="#9CA3AF" />}
                </button>
              </div>
              <div style={{ marginTop: '12px' }}>
                <PasswordStrength password={password} variant="employer" />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label style={labelStyle}>Confirmar contraseña *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    ...inputStyle,
                    paddingRight: '48px',
                    boxSizing: 'border-box'
                  }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showConfirmPassword ? <FiEyeOff size={20} color="#9CA3AF" /> : <FiEye size={20} color="#9CA3AF" />}
                </button>
              </div>
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
                      setShowTermsModal(true);
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
      <TermsModal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)} 
        variant="employer"
      />
    </>
  );
}

const formLogoContainerStyle: React.CSSProperties = {
  width: '64px',
  height: '64px',
  background: '#FFFFFF',
  borderRadius: '16px',
  padding: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

