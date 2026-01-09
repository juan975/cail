import { useMemo, useState } from 'react';
import { FiArrowLeft, FiSearch, FiCheck } from 'react-icons/fi';
import { InputField } from '../../components/ui/InputField';
import { Button } from '../../components/ui/Button';
import { LoadingSplash } from '../../components/ui/LoadingSplash';
import { authService } from '../../services/auth.service';

interface RegisterEmployerFormProps {
  onSuccess: (data: any) => void;
  onBack: () => void;
  onSwitchToLogin: () => void;
}

const empresasDB = [
  {
    nombre: 'CAFRILOSA',
    cargo: 'Gerente de Recursos Humanos',
    contacto: 'María José Espinoza',
    telefono: '07-2570145',
    correo: 'rrhh@cafrilosa.com.ec',
  },
  {
    nombre: 'CLIPP',
    cargo: 'Coordinador de Talento Humano',
    contacto: 'Carlos Mendoza',
    telefono: '07-2581234',
    correo: 'talento@clipp.com.ec',
  },
  {
    nombre: 'CORPORACIÓN DE FERIAS DE LOJA',
    cargo: 'Jefe de Recursos Humanos',
    contacto: 'Ana Gabriela Torres',
    telefono: '07-2573890',
    correo: 'rrhh@feriasloja.com.ec',
  },
  {
    nombre: 'CREVIGO',
    cargo: 'Director de Talento',
    contacto: 'Roberto Sánchez',
    telefono: '07-2569087',
    correo: 'direccion@crevigo.com.ec',
  },
  {
    nombre: 'DECORTEJA',
    cargo: 'Gerente General',
    contacto: 'Patricia Luna',
    telefono: '07-2554321',
    correo: 'gerencia@decorteja.com.ec',
  },
  {
    nombre: 'DELAROMA S.A',
    cargo: 'Jefe de Personal',
    contacto: 'Miguel Ángel Ríos',
    telefono: '07-2567890',
    correo: 'personal@delaroma.com.ec',
  },
  {
    nombre: 'ECOLAC',
    cargo: 'Coordinadora de RRHH',
    contacto: 'Laura Jiménez',
    telefono: '07-2578901',
    correo: 'rrhh@ecolac.com.ec',
  },
];

export function RegisterEmployerForm({ onSuccess, onBack, onSwitchToLogin }: RegisterEmployerFormProps) {
  const [empresaNombre, setEmpresaNombre] = useState('');
  const [cargo, setCargo] = useState('');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');

  const [showDropdown, setShowDropdown] = useState(false);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [splashSuccess, setSplashSuccess] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);

  const empresasFiltradas = useMemo(
    () => empresasDB.filter((empresa) => empresa.nombre.toLowerCase().includes(empresaNombre.toLowerCase())),
    [empresaNombre]
  );

  const seleccionarEmpresa = (empresa: typeof empresasDB[number]) => {
    setEmpresaNombre(empresa.nombre);
    setCargo(empresa.cargo);
    setContacto(empresa.contacto);
    setTelefono(empresa.telefono);
    setCorreo(empresa.correo);
    setEmpresaSeleccionada(empresa.nombre);
    setShowDropdown(false);
  };

  const handleSubmit = async () => {
    if (!empresaNombre || !cargo || !contacto || !telefono || !correo) {
      window.alert('Completa todos los campos requeridos.');
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
        },
      });

      setPendingData({
        id: response.idCuenta,
        company: empresaNombre,
        contactName: contacto,
        email: correo,
        needsPasswordChange: true,
        isEmailVerified: false,
        showWelcomeModal: true,
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
        <div>
          <div style={{ fontWeight: 700 }}>Registro de empleador</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Valida tu empresa y datos de contacto</div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ position: 'relative' }}>
          <InputField
            label="Empresa"
            value={empresaNombre}
            onChange={(event) => {
              setEmpresaNombre(event.target.value);
              setShowDropdown(true);
              setEmpresaSeleccionada('');
            }}
            placeholder="Busca tu empresa"
          />
          <FiSearch style={{ position: 'absolute', right: 14, top: 38, color: '#9CA3AF' }} />
        </div>

        {showDropdown && empresasFiltradas.length > 0 && (
          <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 8, maxHeight: 180, overflowY: 'auto' }}>
            {empresasFiltradas.map((empresa) => (
              <button
                key={empresa.nombre}
                type="button"
                onClick={() => seleccionarEmpresa(empresa)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: 'none',
                  background: empresaSeleccionada === empresa.nombre ? '#FFF7ED' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 600 }}>{empresa.nombre}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>{empresa.cargo}</div>
              </button>
            ))}
          </div>
        )}

        <InputField label="Cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} />
        <InputField label="Nombre de contacto" value={contacto} onChange={(e) => setContacto(e.target.value)} />
        <InputField label="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        <InputField label="Correo" value={correo} onChange={(e) => setCorreo(e.target.value)} type="email" />
        <Button
          label={loading ? 'Creando cuenta...' : 'Crear cuenta'}
          onPress={handleSubmit}
          disabled={loading}
          tone="employer"
          fullWidth
        />

        <button
          type="button"
          onClick={onSwitchToLogin}
          style={{ border: 'none', background: 'transparent', color: '#F59E0B', cursor: 'pointer' }}
        >
          Ya tengo una cuenta
        </button>
      </div>
    </div>
  );
}
