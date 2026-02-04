import { FiX, FiFileText, FiMapPin, FiGlobe, FiBookOpen, FiUserCheck, FiCheckCircle, FiGift, FiRefreshCcw, FiShield, FiLock, FiExternalLink, FiAlertTriangle, FiMail, FiEdit3, FiInfo } from 'react-icons/fi';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: 'candidate' | 'employer';
}

type Section = {
  id: string;
  title: string;
  icon: JSX.Element;
  description?: string;
  bullets?: string[];
  footerNote?: string;
};

const sections = (color: string): Section[] => [
  {
    id: 'info',
    title: '1. Información General y Dominio',
    icon: <FiMapPin size={18} color={color} />,
    description:
      'La Bolsa de Empleo Conjunta es administrada por la Cámara de Industrias de Loja (CAIL). Domicilio: Calle Agustín Carrión Palacios y Av. Salvador Bustamante Celi (Complejo Ferial Simón Bolívar).',
    bullets: [
      'Contacto: secretaria@camaradeindustriasdeloja.ec',
      'Teléfono: 072-613234',
    ],
  },
  {
    id: 'scope',
    title: '2. Objeto y Ámbito de Aplicación',
    icon: <FiGlobe size={18} color={color} />,
    description:
      'La plataforma actúa como un marketplace de servicios laborales que conecta candidatos y oportunidades para facilitar reclutamiento y selección.',
    bullets: [
      'Cláusula de limitación geográfica: el servicio se limita a oportunidades y reclutadores que operan en Loja, Ecuador.',
      'No existe relación laboral entre el Usuario y CAIL.',
      'CAIL es un intermediario tecnológico; no garantiza la contratación ni la veracidad de las ofertas de terceros.',
    ],
  },
  {
    id: 'definitions',
    title: '3. Definiciones',
    icon: <FiBookOpen size={18} color={color} />,
    bullets: [
      'CAIL: administrador de la plataforma.',
      'Servicios: funcionalidades de registro de perfil, publicación de ofertas, postulación y gestión de procesos.',
      'Usuario: persona natural (Candidato) o jurídica (Empleador) que navega y usa la plataforma.',
      'Candidato: usuario que busca empleo y registra su hoja de vida.',
      'Empleador: usuario corporativo que publica ofertas de trabajo.',
    ],
  },
  {
    id: 'acceptance',
    title: '4. Aceptación y Capacidad Legal',
    icon: <FiUserCheck size={18} color={color} />,
    bullets: [
      'Uso exclusivo para mayores de 18 años con capacidad legal.',
      'Está prohibido el registro y uso por menores de edad.',
      'Al crear una cuenta, el usuario declara cumplir con este requisito.',
    ],
  },
  {
    id: 'duties',
    title: '5. Obligaciones de los Usuarios',
    icon: <FiCheckCircle size={18} color={color} />,
    bullets: [
      'Proporcionar información veraz, precisa y actualizada.',
      'No suplantar identidades ni usar datos falsos.',
      'No introducir virus ni código malicioso.',
      'No realizar explotación comercial, venta de perfiles o extracción masiva de datos.',
      'Usar el servicio solo para búsqueda de empleo o reclutamiento de personal.',
      'Mantener la confidencialidad de sus credenciales y no compartir la cuenta.',
    ],
    footerNote: 'CAIL no se responsabiliza por la veracidad de datos divulgados por usuarios en CVs u ofertas.',
  },
  {
    id: 'free',
    title: '6. Modelo de Servicio Gratuito',
    icon: <FiGift size={18} color={color} />,
    bullets: [
      'Acceso y uso gratuito para candidatos y empleadores.',
      'CAIL no cobra comisiones, suscripciones ni tarifas por publicación.',
      'No aplican políticas de devolución, facturación ni reembolso.',
    ],
  },
  {
    id: 'accuracy',
    title: '7. Actualización de la Información',
    icon: <FiRefreshCcw size={18} color={color} />,
    bullets: [
      'CAIL hará su mejor esfuerzo por mantener la información precisa.',
      'El usuario debe verificar la vigencia de las ofertas antes de postular.',
    ],
  },
  {
    id: 'ip',
    title: '8. Derechos de Propiedad Intelectual',
    icon: <FiShield size={18} color={color} />,
    bullets: [
      'CAIL es titular del diseño, código fuente, software y marcas de la plataforma.',
      'Licencia: uso limitado, revocable y no exclusivo para intermediación laboral.',
      'Contenido del usuario: el usuario conserva propiedad y otorga a CAIL licencia gratuita para alojar y procesar su información.',
      'Prohibido copiar, modificar, distribuir o vender el contenido sin autorización escrita.',
    ],
  },
  {
    id: 'privacy',
    title: '9. Protección de Datos Personales',
    icon: <FiLock size={18} color={color} />,
    bullets: [
      'El tratamiento de datos se rige por la Política de Protección de Datos Personales de CAIL.',
      'Al usar el servicio, el usuario acepta compartir datos con reclutadores (candidatos) o postulantes (empleadores) para fines de selección.',
    ],
  },
  {
    id: 'links',
    title: '10. Enlaces de Terceros',
    icon: <FiExternalLink size={18} color={color} />,
    bullets: [
      'La plataforma puede contener enlaces a sitios de terceros.',
      'CAIL no es responsable por contenido, políticas o prácticas de los sitios enlazados.',
    ],
  },
  {
    id: 'liability',
    title: '11. Exclusión de Garantías y Limitación de Responsabilidad',
    icon: <FiAlertTriangle size={18} color={color} />,
    bullets: [
      'El servicio se presta “tal cual” y “según disponibilidad”.',
      'CAIL no responde por interrupciones, virus o fallos de conexión ajenos.',
      'No garantiza el éxito o fracaso de contrataciones ni la conducta de usuarios.',
      'Responsabilidad total limitada a USD $0.00 por ser un servicio gratuito.',
    ],
  },
  {
    id: 'comms',
    title: '12. Comunicaciones',
    icon: <FiMail size={18} color={color} />,
    bullets: [
      'El usuario acepta recibir comunicaciones por correo, WhatsApp o SMS sobre postulaciones, seguridad o nuevas funciones.',
    ],
  },
  {
    id: 'changes',
    title: '13. Modificaciones',
    icon: <FiEdit3 size={18} color={color} />,
    bullets: [
      'CAIL puede modificar estos términos en cualquier momento.',
      'Las modificaciones rigen desde su publicación; el uso continuado implica aceptación.',
    ],
  },
  {
    id: 'law',
    title: '14. Legislación y Solución de Conflictos',
    icon: <FiInfo size={18} color={color} />,
    bullets: [
      'Se rigen por las leyes de la República del Ecuador.',
      'Las partes intentarán una negociación informal de 30 días antes de escalar.',
      'Cláusula arbitral: el conflicto se resolverá mediante arbitraje administrado por el Centro de Arbitraje y Mediación de la Cámara de Industrias de Loja (o conforme a la Ley de Arbitraje y Mediación de Ecuador) en la ciudad de Loja. Idioma: español. Un árbitro.',
    ],
  },
];

export function TermsModal({ isOpen, onClose, variant = 'candidate' }: TermsModalProps) {
  if (!isOpen) return null;

  const primaryColor = variant === 'employer' ? '#F59E0B' : '#10B981';
  const bgColor = variant === 'employer' ? '#FFF7ED' : '#F0FDF4';

  const modalSections = sections(primaryColor);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      zIndex: 20000,
      backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <div 
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '85vh',
          background: '#FFFFFF',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FFFFFF',
          position: 'sticky',
          top: 0,
          zIndex: 1
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: bgColor,
              color: primaryColor,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0
            }}>
              <FiFileText size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>
                Términos y Condiciones
              </h2>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0 0' }}>
                Bolsa de Empleo CAIL · Versión 1.0
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: '#F3F4F6',
              color: '#6B7280',
              border: 'none',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#E5E7EB'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#F3F4F6'}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '32px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          background: '#FFFFFF'
        }}>
          {modalSections.map((section) => (
            <div key={section.id} style={{
              padding: '24px',
              borderRadius: '16px',
              background: '#F9FAFB',
              border: '1px solid #F3F4F6',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: '#FFFFFF',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}>
                  {section.icon}
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>
                  {section.title}
                </h3>
              </div>
              
              {section.description && (
                <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: '1.6', margin: 0 }}>
                  {section.description}
                </p>
              )}
              
              {section.bullets && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {section.bullets.map((bullet, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <div style={{ 
                        width: '6px', 
                        height: '6px', 
                        borderRadius: '50%', 
                        background: primaryColor, 
                        marginTop: '7px',
                        flexShrink: 0
                      }} />
                      <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: '1.5', margin: 0 }}>
                        {bullet}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              
              {section.footerNote && (
                <p style={{ 
                  fontSize: '12px', 
                  color: '#9CA3AF', 
                  fontStyle: 'italic',
                  margin: '4px 0 0 0',
                  paddingTop: '8px',
                  borderTop: '1px dashed #E5E7EB'
                }}>
                  {section.footerNote}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px 32px',
          borderTop: '1px solid #F3F4F6',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '16px',
          background: '#F9FAFB'
        }}>
          <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0, flex: 1 }}>
            Última actualización: 12 de noviembre de 2025
          </p>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              background: primaryColor,
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: `0 4px 12px ${primaryColor}44`,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
