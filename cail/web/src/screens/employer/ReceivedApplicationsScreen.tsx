import { useCallback, useEffect, useMemo, useState } from 'react';
import { colors } from '../../theme/colors';
import { applicationsService } from '../../services/applications.service';
import { offersService } from '../../services/offers.service';
import { ApplicationWithCandidate, ApplicationStatus as ApiStatus } from '../../types/applications.types';

type ApplicationStatus = 'pending' | 'review' | 'accepted' | 'rejected';

// Mapea estado de API a estado local
const mapApiStatus = (status: ApiStatus): ApplicationStatus => {
  const statusMap: Record<ApiStatus, ApplicationStatus> = {
    'PENDIENTE': 'pending',
    'EN_REVISION': 'review',
    'ACEPTADA': 'accepted',
    'RECHAZADA': 'rejected'
  };
  return statusMap[status] || 'pending';
};

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
  matchScore?: number;
}

// Convierte aplicación de API a formato local
const mapApiToLocal = (app: ApplicationWithCandidate, offerTitle: string): Application => {
  const candidato = app.candidato;
  const nombre = candidato?.nombreCompleto || 'Candidato';
  const initials = nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const fecha = new Date(app.fechaAplicacion);

  return {
    id: app.idAplicacion,
    candidateName: nombre,
    initials,
    department: candidato?.resumenProfesional?.substring(0, 50) || 'Perfil pendiente',
    position: offerTitle,
    education: candidato?.nivelEducativo || 'No especificado',
    experience: candidato?.experienciaAnios ? `${candidato.experienciaAnios} años de exp.` : 'No especificado',
    email: candidato?.email || 'email@pendiente.com',
    phone: candidato?.telefono || 'No especificado',
    location: candidato?.ciudad || 'No especificado',
    skills: [...(candidato?.habilidadesTecnicas || []), ...(candidato?.habilidadesBlandas || [])].slice(0, 5),
    receivedDate: fecha.toLocaleDateString('es-EC'),
    status: mapApiStatus(app.estado),
    matchScore: app.matchScore,
    cvFile: app.candidato?.cvUrl,
  };
};

const statusBadges: Record<ApplicationStatus, { label: string; bg: string; color: string }> = {
  pending: { label: 'Pendiente', bg: '#FEF3C7', color: '#92400E' },
  review: { label: 'En Revisión', bg: '#DBEAFE', color: '#1E40AF' },
  accepted: { label: 'Aceptado', bg: '#D1FAE5', color: '#065F46' },
  rejected: { label: 'Rechazado', bg: '#FEE2E2', color: '#991B1B' },
};

export default function ReceivedApplicationsScreen() {
  // Estados de datos
  const [applications, setApplications] = useState<Application[]>([]);
  const [groupedByOffer, setGroupedByOffer] = useState<{ offerId: string; offerTitle: string; apps: Application[] }[]>([]);

  // Estados de UI
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'all' | 'byOffer'>('byOffer');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar aplicaciones desde la API
  const loadApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const myOffers = await offersService.getMyOffers();

      const groupsPromises = myOffers.map(async (offer) => {
        try {
          const apps = await applicationsService.getOfferApplicationsWithCandidates(offer.idOferta);
          return {
            offerId: offer.idOferta,
            offerTitle: offer.titulo,
            apps: apps.map(app => mapApiToLocal(app, offer.titulo))
          };
        } catch (err) {
          console.warn(`Error loading apps for offer ${offer.idOferta}:`, err);
          return { offerId: offer.idOferta, offerTitle: offer.titulo, apps: [] };
        }
      });

      const groups = await Promise.all(groupsPromises);
      setGroupedByOffer(groups);
      setApplications(groups.flatMap(g => g.apps));
    } catch (err: any) {
      console.error('Error loading applications:', err);
      setError(err.message || 'Error al cargar las postulaciones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    review: applications.filter((a) => a.status === 'review').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
  };

  const filteredApplications = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return applications.filter((app) => {
      const matchesSearch =
        query.length === 0 ||
        app.candidateName.toLowerCase().includes(query) ||
        app.skills.some((s) => s.toLowerCase().includes(query)) ||
        app.position.toLowerCase().includes(query);
      return matchesSearch;
    });
  }, [applications, searchQuery]);

  const openEvaluationModal = (app: Application) => {
    setSelectedApplication(app);
    setShowEvaluationModal(true);
  };

  const handleSelectCandidate = async () => {
    if (!selectedApplication) return;
    try {
      // Usar window.confirm para web standard
      if (window.confirm(`¿Estás seguro de aceptar a ${selectedApplication.candidateName}?`)) {
        await applicationsService.updateApplicationStatus(selectedApplication.id, 'ACEPTADA');
        alert('Candidato aceptado exitosamente');
        setShowEvaluationModal(false);
        setSelectedApplication(null);
        loadApplications(); // Recargar datos
      }
    } catch (err) {
      console.error('Error accepting candidate:', err);
      alert('Error al aceptar candidato. Inténtalo de nuevo.');
    }
  };

  const handleReject = async () => {
    if (!selectedApplication) return;
    try {
      if (window.confirm(`¿Estás seguro de rechazar la postulación de ${selectedApplication.candidateName}?`)) {
        await applicationsService.updateApplicationStatus(selectedApplication.id, 'RECHAZADA');
        alert('Postulación rechazada');
        setShowEvaluationModal(false);
        setSelectedApplication(null);
        loadApplications(); // Recargar datos
      }
    } catch (err) {
      console.error('Error rejecting candidate:', err);
      alert('Error al rechazar candidato. Inténtalo de nuevo.');
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div style={{ display: 'grid', gap: 16, padding: '32px' }}>
        <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>⏳</div>
          <div style={{ color: '#6B7280' }}>Cargando postulaciones...</div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div style={{ display: 'grid', gap: 16, padding: '32px' }}>
        <div style={{ textAlign: 'center', padding: 60, background: '#FEF2F2', borderRadius: 14, border: '1px solid #FCA5A5' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
          <div style={{ color: '#DC2626', marginBottom: 12 }}>{error}</div>
          <button
            type="button"
            onClick={loadApplications}
            style={{ padding: '8px 16px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

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
          <div style={{ fontSize: 13, opacity: 0.9 }}>Gestiona candidatos de tus ofertas</div>
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
          onClick={() => setSelectedView('all')}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 10,
            border: 'none',
            background: selectedView === 'all' ? '#FFFFFF' : 'transparent',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          📋 Todas las Postulaciones
        </button>
        <button
          type="button"
          onClick={() => setSelectedView('byOffer')}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 10,
            border: 'none',
            background: selectedView === 'byOffer' ? '#FFFFFF' : 'transparent',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          💼 Por Ofertas
        </button>
      </div>

      {/* Info */}
      <div style={{ background: '#EFF6FF', borderRadius: 14, padding: 14, border: '1px solid #DBEAFE' }}>
        <div style={{ fontSize: 12, color: '#1E40AF' }}>
          {selectedView === 'all'
            ? 'Vista de todas las postulaciones recibidas de tus ofertas publicadas.'
            : 'Postulaciones agrupadas por oferta para facilitar la evaluación.'}
        </div>
      </div>

      {/* Applications */}
      <div>
        {selectedView === 'all' ? (
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
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: 40, background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB' }}>
              No hay postulaciones aún. Cuando los candidatos apliquen a tus ofertas, aparecerán aquí.
            </div>
          )
        ) : groupedByOffer.length > 0 ? (
          groupedByOffer.map((group) =>
            group.apps.length > 0 ? (
              <div key={group.offerId} style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  💼 {group.offerTitle}
                  <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 400 }}>({group.apps.length} postulaciones)</span>
                </div>
                {group.apps.map((app) => (
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
            ) : null
          )
        ) : (
          <div style={{ textAlign: 'center', padding: 40, background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB' }}>
            No hay postulaciones agrupadas. Publica ofertas para recibir candidatos.
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
                📧 {selectedApplication.email}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                📱 {selectedApplication.phone}
              </span>
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {selectedApplication.skills.map((skill) => (
                <span key={skill} style={{ padding: '4px 8px', borderRadius: 8, background: '#F3F4F6', fontSize: 12 }}>
                  {skill}
                </span>
              ))}
            </div>

            {selectedApplication.cvFile && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #F3F4F6' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 4 }}>Curriculum Vitae</div>
                <a
                  href={selectedApplication.cvFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: '#2563EB',
                    textDecoration: 'none',
                    fontSize: 13,
                    background: '#EFF6FF',
                    padding: '8px 12px',
                    borderRadius: 8,
                    width: 'fit-content'
                  }}
                >
                  📄 Ver / Descargar Hoja de Vida
                </a>
              </div>
            )}
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
