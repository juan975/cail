import { useMemo, useState } from 'react';
import {
  FiBriefcase,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiFileText,
  FiInfo,
  FiMail,
  FiPhone,
  FiSearch,
  FiUser,
  FiX,
  FiXCircle,
} from 'react-icons/fi';
import { useResponsiveLayout } from '../../hooks/useResponsive';

type ApplicationStatus = 'pending' | 'review' | 'accepted' | 'rejected';

interface Application {
  id: string;
  candidateName: string;
  initials: string;
  department: string;
  position: string;
  education: string;
  experience: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  receivedDate: string;
  status: ApplicationStatus;
  cvFile?: string;
}

const mockSpontaneousApplications: Application[] = [
  {
    id: '1',
    candidateName: 'María Fernanda González',
    initials: 'MF',
    department: 'Desarrollo de Software',
    position: 'Desarrollador Backend',
    education: 'Ingeniería en Sistemas',
    experience: '3 años de exp.',
    email: 'mf.gonzalez@email.com',
    phone: '0998765432',
    location: 'Loja',
    skills: ['Node.js', 'API Rest', 'SQL/NoSQL'],
    receivedDate: '27/10/2025',
    status: 'pending',
    cvFile: 'CV_Maria_Fernanda_Gonzalez.pdf',
  },
  {
    id: '2',
    candidateName: 'Carlos Alberto Moreno',
    initials: 'CA',
    department: 'Tecnologías de la Información',
    position: 'Analista de Seguridad Informática',
    education: 'Ingeniería en Ciencias de la Computación',
    experience: '5 años de exp.',
    email: 'ca.moreno@email.com',
    phone: '0987654321',
    location: 'Loja',
    skills: ['Ciberseguridad', 'Penetration Testing', 'Firewalls'],
    receivedDate: '26/10/2025',
    status: 'pending',
  },
];

const mockOfferApplications: Application[] = [
  {
    id: 'a1',
    candidateName: 'Lucía Andrade Vega',
    initials: 'LA',
    department: 'Analítica de Datos',
    position: 'Data Analyst',
    education: 'Ingeniería en Estadística',
    experience: '4 años de exp.',
    email: 'lucia.ava@email.com',
    phone: '0991112233',
    location: 'Quito',
    skills: ['SQL', 'Power BI', 'Python', 'ETL'],
    receivedDate: '18/10/2025',
    status: 'pending',
    cvFile: 'CV_Lucia_Andrade.pdf',
  },
  {
    id: 'a2',
    candidateName: 'Jorge Cabrera Mora',
    initials: 'JC',
    department: 'Infraestructura',
    position: 'Ingeniero DevOps',
    education: 'Ingeniería de Sistemas',
    experience: '6 años de exp.',
    email: 'jorge.cabrera@email.com',
    phone: '0982223344',
    location: 'Guayaquil',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
    receivedDate: '17/10/2025',
    status: 'review',
  },
];

const statusBadges: Record<ApplicationStatus, { label: string; bg: string; color: string }> = {
  pending: { label: 'Pendiente', bg: '#FEF3C7', color: '#92400E' },
  review: { label: 'En Revisión', bg: '#DBEAFE', color: '#1E40AF' },
  accepted: { label: 'Aceptado', bg: '#D1FAE5', color: '#065F46' },
  rejected: { label: 'Rechazado', bg: '#FEE2E2', color: '#991B1B' },
};

export default function ApplicationsScreen() {
  const { contentWidth, horizontalGutter } = useResponsiveLayout();
  const [spontaneousApplications, setSpontaneousApplications] = useState<Application[]>(mockSpontaneousApplications);
  const [offerApplications, setOfferApplications] = useState<Application[]>(mockOfferApplications);
  const [selectedView, setSelectedView] = useState<'cvs' | 'offers'>('cvs');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedSource, setSelectedSource] = useState<'cvs' | 'offers'>('cvs');
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [experienceFilter] = useState('Toda exp.');
  const [statusFilter] = useState('Todos');

  const activeApplications = selectedView === 'cvs' ? spontaneousApplications : offerApplications;

  const stats = {
    total: activeApplications.length,
    pending: activeApplications.filter((a) => a.status === 'pending').length,
    review: activeApplications.filter((a) => a.status === 'review').length,
    accepted: activeApplications.filter((a) => a.status === 'accepted').length,
  };

  const filteredApplications = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return activeApplications.filter((app) => {
      const matchesSearch =
        query.length === 0 ||
        app.candidateName.toLowerCase().includes(query) ||
        app.skills.some((s) => s.toLowerCase().includes(query)) ||
        app.position.toLowerCase().includes(query);
      return matchesSearch;
    });
  }, [activeApplications, searchQuery]);

  const groupedApplications = useMemo(() => {
    return filteredApplications.reduce((acc, app) => {
      if (!acc[app.position]) {
        acc[app.position] = [];
      }
      acc[app.position].push(app);
      return acc;
    }, {} as Record<string, Application[]>);
  }, [filteredApplications]);

  const openEvaluationModal = (app: Application) => {
    setSelectedApplication(app);
    setSelectedSource(selectedView);
    setShowEvaluationModal(true);
  };

  const handleSelectCandidate = () => {
    if (!selectedApplication) return;
    const updateStatus = (list: Application[]) =>
      list.map((app) => (app.id === selectedApplication.id ? { ...app, status: 'accepted' } : app));
    if (selectedSource === 'cvs') {
      setSpontaneousApplications((prev) => updateStatus(prev));
    } else {
      setOfferApplications((prev) => updateStatus(prev));
    }
    setShowEvaluationModal(false);
    setSelectedApplication(null);
  };

  const handleReject = () => {
    if (!selectedApplication) return;
    const updateStatus = (list: Application[]) =>
      list.map((app) => (app.id === selectedApplication.id ? { ...app, status: 'rejected' } : app));
    if (selectedSource === 'cvs') {
      setSpontaneousApplications((prev) => updateStatus(prev));
    } else {
      setOfferApplications((prev) => updateStatus(prev));
    }
    setShowEvaluationModal(false);
    setSelectedApplication(null);
  };

  return (
    <div style={{ padding: `16px ${horizontalGutter}px 24px` }}>
      <div style={{ maxWidth: contentWidth, margin: '0 auto', display: 'grid', gap: 16 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
            <StatBox label="Total" value={stats.total} />
            <StatBox label="Pendiente" value={stats.pending} color="#F59E0B" />
            <StatBox label="En Revisión" value={stats.review} color="#3B82F6" />
            <StatBox label="Aceptado" value={stats.accepted} color="#10B981" />
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: '1px solid #E5E7EB', display: 'grid', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, habilidades..."
              style={{ width: '100%', padding: '12px 40px 12px 14px', borderRadius: 12, border: '1px solid #E5E7EB' }}
            />
            <FiSearch style={{ position: 'absolute', right: 14, top: 14, color: '#9CA3AF' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" style={filterButtonStyle}>
              {experienceFilter} <FiChevronDown />
            </button>
            <button type="button" style={filterButtonStyle}>
              {statusFilter} <FiChevronDown />
            </button>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: 8, border: '1px solid #E5E7EB', display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setSelectedView('cvs')}
            style={{
              ...viewTabStyle,
              background: selectedView === 'cvs' ? '#F3F4F6' : 'transparent',
            }}
          >
            <FiFileText /> CVs Espontáneos
          </button>
          <button
            type="button"
            onClick={() => setSelectedView('offers')}
            style={{
              ...viewTabStyle,
              background: selectedView === 'offers' ? '#F3F4F6' : 'transparent',
            }}
          >
            <FiBriefcase /> Por Ofertas
          </button>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <FiInfo size={16} color="#1E40AF" />
            <div style={{ fontSize: 12, color: '#1E40AF' }}>
              {selectedView === 'cvs'
                ? 'CVs recibidos espontáneamente: candidatos que enviaron su hoja de vida sin aplicar a una oferta específica.'
                : 'Postulaciones por oferta: candidatos que aplicaron a tus ofertas publicadas.'}
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: '1px solid #E5E7EB' }}>
          {selectedView === 'cvs' ? (
            filteredApplications.length > 0 ? (
              filteredApplications.map((app) => (
                <ApplicationCard key={app.id} application={app} onPress={() => openEvaluationModal(app)} />
              ))
            ) : (
              <EmptyState message="No hay CVs que coincidan. Ajusta filtros o busca por nombre/habilidad." />
            )
          ) : Object.entries(groupedApplications).length > 0 ? (
            Object.entries(groupedApplications).map(([position, apps]) => (
              <div key={position} style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>{position}</div>
                {apps.map((app) => (
                  <ApplicationCard key={app.id} application={app} onPress={() => openEvaluationModal(app)} />
                ))}
              </div>
            ))
          ) : (
            <EmptyState message="No hay postulaciones para mostrar." />
          )}
        </div>
      </div>

      {showEvaluationModal && selectedApplication && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 50,
          }}
        >
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, width: 'min(720px, 92%)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>{selectedApplication.candidateName}</h3>
              <button type="button" onClick={() => setShowEvaluationModal(false)} style={{ border: 'none', background: 'transparent' }}>
                <FiX />
              </button>
            </div>
            <div style={{ marginTop: 12, display: 'grid', gap: 6, fontSize: 13, color: '#4B5563' }}>
              <div>Puesto: {selectedApplication.position}</div>
              <div>Departamento: {selectedApplication.department}</div>
              <div>Educación: {selectedApplication.education}</div>
              <div>Experiencia: {selectedApplication.experience}</div>
              <div>Ubicación: {selectedApplication.location}</div>
              <div>
                Estado:
                <span style={{ marginLeft: 6, padding: '4px 8px', borderRadius: 12, background: statusBadges[selectedApplication.status].bg, color: statusBadges[selectedApplication.status].color, fontSize: 11, fontWeight: 600 }}>
                  {statusBadges[selectedApplication.status].label}
                </span>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiMail /> {selectedApplication.email}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiPhone /> {selectedApplication.phone}
              </span>
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {selectedApplication.skills.map((skill) => (
                <span key={skill} style={{ padding: '4px 8px', borderRadius: 8, background: '#F3F4F6', fontSize: 12 }}>
                  {skill}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button type="button" onClick={handleReject} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #FCA5A5', background: '#FEF2F2', cursor: 'pointer' }}>
                <FiXCircle /> Rechazar
              </button>
              <button type="button" onClick={handleSelectCandidate} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #10B981', background: '#ECFDF5', cursor: 'pointer' }}>
                <FiCheckCircle /> Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ padding: 12, borderRadius: 12, background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: color || '#111827' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#6B7280' }}>{label}</div>
    </div>
  );
}

function ApplicationCard({ application, onPress }: { application: Application; onPress: () => void }) {
  const badge = statusBadges[application.status];
  return (
    <button
      type="button"
      onClick={onPress}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: 14,
        borderRadius: 12,
        border: '1px solid #E5E7EB',
        background: '#fff',
        marginBottom: 12,
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F3F4F6', display: 'grid', placeItems: 'center' }}>
            <FiUser />
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>{application.candidateName}</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>{application.position}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9CA3AF' }}>
              <FiClock size={12} /> {application.receivedDate}
            </div>
          </div>
        </div>
        <span style={{ padding: '4px 8px', borderRadius: 12, background: badge.bg, color: badge.color, fontSize: 11, fontWeight: 600 }}>
          {badge.label}
        </span>
      </div>
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ padding: 24, textAlign: 'center', color: '#6B7280', fontSize: 13 }}>
      {message}
    </div>
  );
}

const filterButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  borderRadius: 12,
  border: '1px solid #E5E7EB',
  background: '#F9FAFB',
  padding: '8px 12px',
  cursor: 'pointer',
  fontSize: 12,
  color: '#4B5563',
};

const viewTabStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px 12px',
  borderRadius: 12,
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  fontWeight: 600,
};
