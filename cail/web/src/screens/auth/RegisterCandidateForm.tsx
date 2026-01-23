import { useState } from 'react';
import { FiArrowLeft, FiEye, FiEyeOff, FiArrowRight, FiCheck, FiPlus, FiX } from 'react-icons/fi';
import { LoadingSplash } from '../../components/ui/LoadingSplash';
import { useNotifications } from '../../components/ui/Notifications';
import { PasswordStrength, validatePassword } from '../../components/ui/PasswordStrength';
import { authService } from '../../services/auth.service';
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

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '16px 18px',
  fontSize: '16px',
  color: '#0F172A',
  background: '#F1F5F9',
  border: '2px solid transparent',
  borderRadius: '16px',
  outline: 'none',
  transition: 'all 0.3s ease',
  boxSizing: 'border-box',
  fontWeight: 500,
};

const labelStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 800,
  color: '#334155',
  marginBottom: '10px',
  display: 'block',
  marginLeft: '4px'
};

function handleInputFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, color: string) {
  e.target.style.borderColor = `${color}40`;
  e.target.style.background = '#FFFFFF';
  e.target.style.boxShadow = `0 0 0 5px ${color}10`;
}

function handleInputBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.target.style.borderColor = 'transparent';
  e.target.style.background = '#F1F5F9';
  e.target.style.boxShadow = 'none';
}

interface RegisterCandidateFormProps {
  onSuccess: (data: any) => void;
  onBack: () => void;
  onSwitchToLogin: () => void;
}

type Step = 'personal' | 'professional';

export function RegisterCandidateForm({ onSuccess, onBack, onSwitchToLogin }: RegisterCandidateFormProps) {
  const notifications = useNotifications();
  const [step, setStep] = useState<Step>('personal');

  // Personal info
  const [fullName, setFullName] = useState('');
  const [cedula, setCedula] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Loja');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Professional info
  const [professionalSummary, setProfessionalSummary] = useState('');
  const [technicalSkills, setTechnicalSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [newSoftSkill, setNewSoftSkill] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [degree, setDegree] = useState('');
  const [competencies, setCompetencies] = useState<string[]>([]);
  const [newCompetency, setNewCompetency] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [experienceSummary, setExperienceSummary] = useState('');

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [splashSuccess, setSplashSuccess] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);

  const handleContinue = () => {
    if (!fullName || !cedula || !email || !password || !confirmPassword) {
      notifications.alert('Completa todos los campos requeridos.', 'Campos incompletos');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      notifications.alert(passwordValidation.errors[0], 'Contraseña inválida');
      return;
    }

    if (password !== confirmPassword) {
      notifications.alert('Las contraseñas no coinciden.', 'Validación');
      return;
    }

    setStep('professional');
  };

  const addSkill = () => {
    if (newSkill.trim() && !technicalSkills.includes(newSkill.trim())) {
      setTechnicalSkills([...technicalSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setTechnicalSkills(technicalSkills.filter(s => s !== skill));
  };

  const addSoftSkill = () => {
    if (newSoftSkill.trim() && !softSkills.includes(newSoftSkill.trim())) {
      setSoftSkills([...softSkills, newSoftSkill.trim()]);
      setNewSoftSkill('');
    }
  };

  const removeSoftSkill = (skill: string) => {
    setSoftSkills(softSkills.filter(s => s !== skill));
  };

  const addCompetency = () => {
    if (newCompetency.trim() && !competencies.includes(newCompetency.trim())) {
      setCompetencies([...competencies, newCompetency.trim()]);
      setNewCompetency('');
    }
  };

  const removeCompetency = (competency: string) => {
    setCompetencies(competencies.filter(c => c !== competency));
  };

  const handleSubmit = async () => {
    if (!acceptedTerms) {
      notifications.alert('Debes aceptar los términos y condiciones.', 'Requerido');
      return;
    }

    setLoading(true);
    setShowSplash(true);

    try {
      const response = await authService.register({
        email,
        password,
        nombreCompleto: fullName,
        telefono: phone,
        tipoUsuario: 'POSTULANTE',
        candidateData: {
          cedula,
          fechaNacimiento: birthDate,
          direccion: address,
          ciudad: city,
          resumenProfesional: professionalSummary,
          habilidadesTecnicas: technicalSkills,
          softSkills,
          nivelEducacion: educationLevel,
          titulo: degree,
          competencias: competencies,
          anosExperiencia: yearsExperience,
          resumenExperiencia: experienceSummary,
        },
      });

      const userData = {
        id: response.idCuenta,
        name: fullName,
        email,
        progress: 0.5,
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

      <div style={{ ...screenContainerStyle, background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)' }}>
        <button
          onClick={step === 'personal' ? onBack : () => setStep('personal')}
          style={backButtonStyle}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
        >
          <FiArrowLeft size={28} color="#FFFFFF" />
        </button>

        <div style={glassCardStyle}>
          {/* Progress Indicator */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '16px',
            }}>
              <div style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                background: '#10B981',
              }} />
              <div style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                background: step === 'professional' ? '#10B981' : '#E5E7EB',
              }} />
            </div>
            <p style={{
              fontSize: '14px',
              color: '#6B7280',
              fontWeight: 500,
            }}>
              Paso {step === 'personal' ? '1' : '2'} de 2
            </p>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: '32px',
            fontWeight: 800,
            color: '#111827',
            marginBottom: '8px',
            letterSpacing: '-0.5px',
          }}>
            {step === 'personal' ? 'Información Personal' : 'Información Profesional'}
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6B7280',
            marginBottom: '32px',
          }}>
            {step === 'personal' ? 'Crea tu cuenta de candidato' : 'Completa tu perfil profesional'}
          </p>

          {/* Form */}
          {step === 'personal' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Full Name */}
              <div>
                <label style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px',
                  display: 'block',
                }}>
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ingresa tu nombre completo"
                  style={inputStyle}
                  onFocus={(e) => handleInputFocus(e, '#10B981')}
                  onBlur={handleInputBlur}
                />
              </div>

              {/* Cedula and Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '8px',
                    display: 'block',
                  }}>
                    Cédula *
                  </label>
                  <input
                    type="text"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    placeholder="Ej: 1104567890"
                    maxLength={10}
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
                      e.target.style.borderColor = '#10B981';
                      e.target.style.background = '#FFFFFF';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E7EB';
                      e.target.style.background = '#F9FAFB';
                    }}
                  />
                </div>

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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej: 0987654321"
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
                      e.target.style.borderColor = '#10B981';
                      e.target.style.background = '#FFFFFF';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E7EB';
                      e.target.style.background = '#F9FAFB';
                    }}
                  />
                </div>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ej: maria.calle@email.com"
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
                      e.target.style.borderColor = '#10B981';
                      e.target.style.background = '#FFFFFF';
                    }}
                  onBlur={(e) => {
                      e.target.style.borderColor = '#E5E7EB';
                      e.target.style.background = '#F9FAFB';
                    }}
                  />
              </div>

              {/* Birth Date and City */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '8px',
                    display: 'block',
                  }}>
                    Fecha de nacimiento
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
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
                      e.target.style.borderColor = '#10B981';
                      e.target.style.background = '#FFFFFF';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E7EB';
                      e.target.style.background = '#F9FAFB';
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '8px',
                    display: 'block',
                  }}>
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Loja"
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
                      e.target.style.borderColor = '#10B981';
                      e.target.style.background = '#FFFFFF';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E7EB';
                      e.target.style.background = '#F9FAFB';
                    }}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px',
                  display: 'block',
                }}>
                  Dirección
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ej: Av. Universitaria y Calle Lourdes, número de casa"
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
                    e.target.style.borderColor = '#10B981';
                    e.target.style.background = '#FFFFFF';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.background = '#F9FAFB';
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px',
                  display: 'block',
                }}>
                  Contraseña *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres, incluye mayúsculas y números"
                    style={{
                      width: '100%',
                      padding: '14px 50px 14px 16px',
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
                      e.target.style.borderColor = '#10B981';
                      e.target.style.background = '#FFFFFF';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E7EB';
                      e.target.style.background = '#F9FAFB';
                    }}
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
                  <PasswordStrength password={password} variant="candidate" />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px',
                  display: 'block',
                }}>
                  Confirmar contraseña *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma tu contraseña"
                    style={{
                      width: '100%',
                      padding: '14px 50px 14px 16px',
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
                      e.target.style.borderColor = '#10B981';
                      e.target.style.background = '#FFFFFF';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E7EB';
                      e.target.style.background = '#F9FAFB';
                    }}
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

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '12px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.4)';
                }}
              >
                Continuar
                <FiArrowRight size={20} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Professional Summary */}
              <div>
                <label style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px',
                  display: 'block',
                }}>
                  Resumen profesional
                </label>
                <textarea
                  value={professionalSummary}
                  onChange={(e) => setProfessionalSummary(e.target.value)}
                  placeholder="Ej: He trabajado en proyectos de desarrollo web y móvil..."
                  rows={4}
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
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#10B981';
                    e.target.style.background = '#FFFFFF';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.background = '#F9FAFB';
                  }}
                />
              </div>

              {/* Technical Skills */}
              <div>
                <label style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px',
                  display: 'block',
                }}>
                  Habilidades técnicas
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="Ej: Excel, Python, AutoCAD..."
                    style={{
                      flex: 1,
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
                      e.target.style.borderColor = '#10B981';
                      e.target.style.background = '#FFFFFF';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E7EB';
                      e.target.style.background = '#F9FAFB';
                    }}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '12px',
                      border: 'none',
                      background: '#10B981',
                      cursor: 'pointer',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                    aria-label="Agregar habilidad técnica"
                  >
                    <FiPlus size={22} color="#FFFFFF" />
                  </button>
                </div>

                {technicalSkills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                    {technicalSkills.map((skill) => (
                      <div
                        key={skill}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 10px',
                          background: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          borderRadius: 999,
                          fontSize: 13,
                          color: '#1D4ED8',
                          fontWeight: 600,
                        }}
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            display: 'grid',
                            placeItems: 'center',
                            padding: 2,
                          }}
                          aria-label={`Quitar ${skill}`}
                        >
                          <FiX size={16} color="#1D4ED8" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Soft Skills */}
              <div>
                <label style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px',
                  display: 'block',
                }}>
                  Soft skills
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={newSoftSkill}
                    onChange={(e) => setNewSoftSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSoftSkill();
                      }
                    }}
                    placeholder="Ej: Trabajo en equipo, Liderazgo, Comunicación..."
                    style={{
                      flex: 1,
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
                      e.target.style.borderColor = '#10B981';
                      e.target.style.background = '#FFFFFF';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E7EB';
                      e.target.style.background = '#F9FAFB';
                    }}
                  />
                  <button
                    type="button"
                    onClick={addSoftSkill}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '12px',
                      border: 'none',
                      background: '#10B981',
                      cursor: 'pointer',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                    aria-label="Agregar soft skill"
                  >
                    <FiPlus size={22} color="#FFFFFF" />
                  </button>
                </div>

                {softSkills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                    {softSkills.map((skill) => (
                      <div
                        key={skill}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 10px',
                          background: '#F0FDF4',
                          border: '1px solid #BBF7D0',
                          borderRadius: 999,
                          fontSize: 13,
                          color: '#0B7A4D',
                          fontWeight: 600,
                        }}
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSoftSkill(skill)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            display: 'grid',
                            placeItems: 'center',
                            padding: 2,
                          }}
                          aria-label={`Quitar ${skill}`}
                        >
                          <FiX size={16} color="#0B7A4D" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Competencies */}
              <div>
                <label style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px',
                  display: 'block',
                }}>
                  Competencias
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={newCompetency}
                    onChange={(e) => setNewCompetency(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCompetency();
                      }
                    }}
                    placeholder="Ej: Gestión de proyectos, Negociación..."
                    style={{
                      flex: 1,
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
                      e.target.style.borderColor = '#10B981';
                      e.target.style.background = '#FFFFFF';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E5E7EB';
                      e.target.style.background = '#F9FAFB';
                    }}
                  />
                  <button
                    type="button"
                    onClick={addCompetency}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '12px',
                      border: 'none',
                      background: '#10B981',
                      cursor: 'pointer',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                    aria-label="Agregar competencia"
                  >
                    <FiPlus size={22} color="#FFFFFF" />
                  </button>
                </div>

                {competencies.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                    {competencies.map((competency) => (
                      <div
                        key={competency}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 10px',
                          background: '#FFFBEB',
                          border: '1px solid #FDE68A',
                          borderRadius: 999,
                          fontSize: 13,
                          color: '#B45309',
                          fontWeight: 600,
                        }}
                      >
                        {competency}
                        <button
                          type="button"
                          onClick={() => removeCompetency(competency)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            display: 'grid',
                            placeItems: 'center',
                            padding: 2,
                          }}
                          aria-label={`Quitar ${competency}`}
                        >
                          <FiX size={16} color="#B45309" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Education Level */}
              <div>
                <label style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px',
                  display: 'block',
                }}>
                  Nivel de educación
                </label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '16px',
                    color: educationLevel ? '#111827' : '#9CA3AF',
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#10B981';
                    e.target.style.background = '#FFFFFF';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.background = '#F9FAFB';
                  }}
                >
                  <option value="">Selecciona tu nivel</option>
                  <option value="Secundaria">Secundaria</option>
                  <option value="Técnico">Técnico</option>
                  <option value="Tecnólogo">Tecnólogo</option>
                  <option value="Universitario">Universitario</option>
                  <option value="Posgrado">Posgrado</option>
                </select>
              </div>

              {/* Years of Experience */}
              <div>
                <label style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px',
                  display: 'block',
                }}>
                  Años de experiencia
                </label>
                <input
                  type="text"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  placeholder="Ej: 3 años, 5+ años, Sin experiencia"
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
                    e.target.style.borderColor = '#10B981';
                    e.target.style.background = '#FFFFFF';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.background = '#F9FAFB';
                  }}
                />
              </div>

              {/* Terms and Conditions */}
              <div style={{
                padding: '16px',
                background: '#F0FDF4',
                borderRadius: '12px',
                border: '1px solid #BBF7D0',
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
                      accentColor: '#10B981',
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
                        color: '#10B981',
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
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
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
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.4)';
                }}
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                {!loading && <FiCheck size={20} />}
              </button>
            </div>
          )}

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
                color: '#10B981',
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
        variant="candidate"
      />
    </>
  );
}
