import { useMemo, useState } from 'react';
import { colors } from '../../theme/colors';

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

export default function ReceivedApplicationsScreen() {
  const [spontaneousApplications, setSpontaneousApplications] = useState<Application[]>(mockSpontaneousApplications);
  const [offerApplications, setOfferApplications] = useState<Application[]>(mockOfferApplications);
  const [selectedView, setSelectedView] = useState<'cvs' | 'offers'>('cvs');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedSource, setSelectedSource] = useState<'cvs' | 'offers'>('cvs');
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      list.map((app) => (app.id === selectedApplication.id ? { ...app, status: 'accepted' as ApplicationStatus } : app));
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
      list.map((app) => (app.id === selectedApplication.id ? { ...app, status: 'rejected' as ApplicationStatus } : app));
    if (selectedSource === 'cvs') {
      setSpontaneousApplications((prev) => updateStatus(prev));
    } else {
      setOfferApplications((prev) => updateStatus(prev));
    }
    setShowEvaluationModal(false);
    setSelectedApplication(null);
  };

  return (
    <div style={{ display: 'grid', gap: 16, padding: '32px' }}>
      {/* Header */}
      <div
        style={{
          background: '#F1842D',
          borderRadius: 16,
          padding: 20,
          color: '#fff',
          display: 'flex',
          gap: 16,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.2)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Postulaciones recibidas</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>Gestiona candidatos y CVs espontáneos</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        <div style={{ background: '#fff', borderRadius: 14, padding: 14, border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{stats.total}</div>
          <div style={{ fontSize: 12, color: colors.textSecondary }}>Total</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 14, padding: 14, border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#F59E0B' }}>{stats.pending}</div>
          <div style={{ fontSize: 12, color: colors.textSecondary }}>Pendiente</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 14, padding: 14, border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#3B82F6' }}>{stats.review}</div>
          <div style={{ fontSize: 12, color: colors.textSecondary }}>En Revisión</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 14, padding: 14, border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#10B981' }}>{stats.accepted}</div>
          <div style={{ fontSize: 12, color: colors.textSecondary }}>Aceptado</div>
        </div>
      </div>

      {/* Search */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 14, border: '1px solid #E5E7EB' }}>
        <div style={{ position: 'relative' }}>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, habilidades..."
            style={{
              width: '100%',
              padding: '12px 40px 12px 14px',
              borderRadius: 12,
              border: '1px solid #E5E7EB',
              fontSize: 14,
              outline: 'none',
            }}
          />
          <svg
            width="18"
            height="18"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ position: 'absolute', right: 14, top: 14, color: '#9CA3AF' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, background: '#F3F4F6', padding: 6, borderRadius: 12 }}>
        <button
          type="button"
          onClick={() => setSelectedView('cvs')}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 10,
            border: 'none',
            background: selectedView === 'cvs' ? '#FFFFFF' : 'transparent',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          CVs Espontáneos
        </button>
        <button
          type="button"
          onClick={() => setSelectedView('offers')}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 10,
            border: 'none',
            background: selectedView === 'offers' ? '#FFFFFF' : 'transparent',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Por Ofertas
        </button>
      </div>

      {/* Info */}
      <div style={{ background: '#EFF6FF', borderRadius: 14, padding: 14, border: '1px solid #DBEAFE' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>

          <div style={{ fontSize: 12, color: '#1E40AF' }}>
            {selectedView === 'cvs'
              ? 'CVs recibidos espontáneamente: candidatos que enviaron su hoja de vida sin aplicar a una oferta específica.'
              : 'Postulaciones por oferta: candidatos que aplicaron a tus ofertas publicadas.'}
          </div>
        </div>
      </div>

      {/* Applications */}
      <div>
        {selectedView === 'cvs' ? (
          filteredApplications.length > 0 ? (
            filteredApplications.map((app) => (
              <div
                key={app.id}
                onClick={() => openEvaluationModal(app)}
                style={{
                  background: '#fff',
                  borderRadius: 14,
                  padding: 14,
                  border: '1px solid #E5E7EB',
                  marginBottom: 12,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: '#F3F4F6',
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 700,
                      }}
                    >
                      {app.initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{app.candidateName}</div>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>{app.position}</div>
                      <div style={{ fontSize: 12, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {app.receivedDate}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: 12,
                      background: statusBadges[app.status].bg,
                      color: statusBadges[app.status].color,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {statusBadges[app.status].label}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: 40, background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB' }}>
              No hay CVs que coincidan
            </div>
          )
        ) : Object.entries(groupedApplications).length > 0 ? (
          Object.entries(groupedApplications).map(([position, apps]) => (
            <div key={position} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{position}</div>
              {apps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => openEvaluationModal(app)}
                  style={{
                    background: '#fff',
                    borderRadius: 14,
                    padding: 14,
                    border: '1px solid #E5E7EB',
                    marginBottom: 12,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: '#F3F4F6',
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: 700,
                        }}
                      >
                        {app.initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{app.candidateName}</div>
                        <div style={{ fontSize: 12, color: '#6B7280' }}>{app.position}</div>
                        <div style={{ fontSize: 12, color: '#9CA3AF' }}>🕐 {app.receivedDate}</div>
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: 12,
                        background: statusBadges[app.status].bg,
                        color: statusBadges[app.status].color,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {statusBadges[app.status].label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: 40, background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB' }}>
            No hay postulaciones para mostrar
          </div>
        )}
      </div>

      {/* Modal */}
      {showEvaluationModal && selectedApplication && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
          onClick={() => setShowEvaluationModal(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 24,
              width: 'min(720px, 92%)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>{selectedApplication.candidateName}</h3>
              <button
                type="button"
                onClick={() => setShowEvaluationModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 20 }}
              >
                ×
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
                <span
                  style={{
                    marginLeft: 6,
                    padding: '4px 8px',
                    borderRadius: 12,
                    background: statusBadges[selectedApplication.status].bg,
                    color: statusBadges[selectedApplication.status].color,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {statusBadges[selectedApplication.status].label}
                </span>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 13 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {selectedApplication.email}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {selectedApplication.phone}
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
              <button
                type="button"
                onClick={handleReject}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: '1px solid #FCA5A5',
                  background: '#FEF2F2',
                  cursor: 'pointer',
                }}
              >
                Rechazar
              </button>
              <button
                type="button"
                onClick={handleSelectCandidate}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: '1px solid #10B981',
                  background: '#ECFDF5',
                  cursor: 'pointer',
                }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
