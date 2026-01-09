import { useState } from 'react';
import { FiArrowLeft, FiUser, FiCheck, FiPlus } from 'react-icons/fi';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import { LoadingSplash } from '../../components/ui/LoadingSplash';
import { PasswordStrength, validatePassword } from '../../components/ui/PasswordStrength';
import { authService } from '../../services/auth.service';

interface RegisterCandidateFormProps {
  onSuccess: (data: any) => void;
  onBack: () => void;
  onSwitchToLogin: () => void;
}

type TabType = 'personal' | 'profesional';

export function RegisterCandidateForm({ onSuccess, onBack, onSwitchToLogin }: RegisterCandidateFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>('personal');

  const [fullName, setFullName] = useState('');
  const [cedula, setCedula] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Loja');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [professionalSummary, setProfessionalSummary] = useState('');
  const [technicalSkills, setTechnicalSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [degree, setDegree] = useState('');
  const [softSkills, setSoftSkills] = useState('');
  const [competencies, setCompetencies] = useState<string[]>([]);
  const [newCompetency, setNewCompetency] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [experienceSummary, setExperienceSummary] = useState('');

  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [splashSuccess, setSplashSuccess] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setTechnicalSkills((prev) => [...prev, newSkill.trim()]);
    setNewSkill('');
  };

  const addCompetency = () => {
    if (!newCompetency.trim()) return;
    setCompetencies((prev) => [...prev, newCompetency.trim()]);
    setNewCompetency('');
  };

  const handleSubmit = async () => {
    if (activeTab === 'personal') {
      if (!fullName || !cedula || !email || !password || !confirmPassword) {
        window.alert('Completa todos los campos requeridos.');
        return;
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        window.alert(passwordValidation.errors[0]);
        return;
      }

      if (password !== confirmPassword) {
        window.alert('Las contraseñas no coinciden.');
        return;
      }

      setActiveTab('profesional');
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
          nivelEducacion: educationLevel,
          titulo: degree,
          competencias: competencies,
          anosExperiencia: yearsExperience,
          resumenExperiencia: experienceSummary,
        },
      });

      setPendingData({
        id: response.idCuenta,
        name: response.nombreCompleto,
        email: response.email,
        progress: 0.4,
      });
      setSplashSuccess(true);
    } catch (error: any) {
      setShowSplash(false);
      setSplashSuccess(false);
      setLoading(false);
      window.alert(error.message || 'Error al crear la cuenta');
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
    <div style={{ display: 'grid', gap: 16 }}>
      <LoadingSplash visible={showSplash} success={splashSuccess} onComplete={handleSplashComplete} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            border: '1px solid #E5E7EB',
            background: '#FFFFFF',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
          }}
        >
          <FiArrowLeft size={18} color="#6B7280" />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: '#ECFDF5',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#0B7A4D',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <FiUser size={18} color="#FFFFFF" />
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>Registro de candidato</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>Completa tu perfil paso a paso</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, background: '#F3F4F6', padding: 6, borderRadius: 12 }}>
        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 10,
            border: 'none',
            background: activeTab === 'personal' ? '#FFFFFF' : 'transparent',
            boxShadow: activeTab === 'personal' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            cursor: 'pointer',
          }}
        >
          Datos personales
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('profesional')}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 10,
            border: 'none',
            background: activeTab === 'profesional' ? '#FFFFFF' : 'transparent',
            boxShadow: activeTab === 'profesional' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            cursor: 'pointer',
          }}
        >
          Perfil profesional
        </button>
      </div>

      {activeTab === 'personal' ? (
        <div style={{ display: 'grid', gap: 12 }}>
          <InputField label="Nombre completo" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <InputField label="Cédula" value={cedula} onChange={(e) => setCedula(e.target.value)} />
            <InputField label="Fecha de nacimiento" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <InputField label="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <InputField label="Ciudad" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <InputField label="Correo" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          <InputField label="Dirección" value={address} onChange={(e) => setAddress(e.target.value)} />
          <InputField label="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
          <InputField
            label="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
          />
          <PasswordStrength password={password} variant="candidate" />
          <Button label="Continuar" onPress={handleSubmit} tone="candidate" fullWidth />
          <button
            type="button"
            onClick={onSwitchToLogin}
            style={{ border: 'none', background: 'transparent', color: '#0B7A4D', cursor: 'pointer' }}
          >
            Ya tengo una cuenta
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          <InputField
            label="Resumen profesional"
            value={professionalSummary}
            onChange={(e) => setProfessionalSummary(e.target.value)}
            multiline
          />
          <div style={{ display: 'grid', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Habilidades técnicas</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <InputField value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Ej. React" />
              <button
                type="button"
                onClick={addSkill}
                style={{
                  width: 44,
                  borderRadius: 10,
                  border: 'none',
                  background: '#3B82F6',
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <FiPlus />
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {technicalSkills.map((skill) => (
                <span key={skill} style={{ background: '#EFF6FF', borderRadius: 8, padding: '6px 10px', fontSize: 12 }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <InputField label="Nivel de educación" value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)} />
            <InputField label="Título" value={degree} onChange={(e) => setDegree(e.target.value)} />
          </div>
          <InputField label="Habilidades blandas" value={softSkills} onChange={(e) => setSoftSkills(e.target.value)} />
          <div style={{ display: 'grid', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Competencias</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <InputField value={newCompetency} onChange={(e) => setNewCompetency(e.target.value)} placeholder="Ej. Liderazgo" />
              <button
                type="button"
                onClick={addCompetency}
                style={{
                  width: 44,
                  borderRadius: 10,
                  border: 'none',
                  background: '#F59E0B',
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <FiCheck />
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {competencies.map((competency) => (
                <span key={competency} style={{ background: '#FEF3C7', borderRadius: 8, padding: '6px 10px', fontSize: 12 }}>
                  {competency}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <InputField label="Años de experiencia" value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} />
            <InputField label="Resumen experiencia" value={experienceSummary} onChange={(e) => setExperienceSummary(e.target.value)} />
          </div>
          <Button
            label={loading ? 'Guardando...' : 'Crear cuenta'}
            onPress={handleSubmit}
            disabled={loading}
            tone="candidate"
            fullWidth
          />
        </div>
      )}
    </div>
  );
}
