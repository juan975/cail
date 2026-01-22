import { useCallback, useEffect, useMemo, useState } from 'react';
import { colors } from '../../theme/colors';
import { useNotifications } from '../../components/ui/Notifications';
import { applicationsService } from '../../services/applications.service';
import { offersService } from '../../services/offers.service';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
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
  workHistory: any[];
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
  const candidato = app.candidato || {} as any;
  console.log('[DEBUG] Candidato Data:', JSON.stringify(candidato, null, 2));

  const profile = candidato.candidateProfile || {};

  const nombre = candidato.nombreCompleto || 'Candidato';
  const initials = nombre.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  const fecha = new Date(app.fechaAplicacion);

  // Helper to find first non-empty value
  const getVal = (...args: any[]) => args.find(v => v !== null && v !== undefined && v !== '');

  const education = getVal(
    candidato.nivelEducativo,
    profile.nivelEducacion,
    profile.educationLevel, // English fallback
    candidato.education
  ) || 'No especificado';

  const yearsExp = getVal(
    candidato.experienciaAnios,
    profile.anosExperiencia,
    profile.yearsExperience,
    candidato.yearsOfExperience
  );

  const experienceStr = yearsExp
    ? (String(yearsExp).includes('años') ? yearsExp : `${yearsExp} años de exp.`)
    : 'No especificado';

  const location = getVal(
    candidato.ciudad,
    profile.ciudad,
    profile.city,
    candidato.location
  ) || 'No especificado';

  const phone = getVal(
    candidato.telefono,
    profile.telefono,
    profile.phone
  ) || 'No especificado';

  const techSkills = candidato.habilidadesTecnicas || profile.habilidadesTecnicas || profile.technicalSkills || [];
  const softSkills = candidato.habilidadesBlandas || profile.softSkills || [];
  const skills = [...techSkills, ...softSkills].slice(0, 5);

  const workHistory = profile.experienciaLaboral || candidato.experienciaLaboral || [];

  return {
    id: app.idAplicacion,
    candidateName: nombre,
    initials,
    department: getVal(profile.resumenProfesional, candidato.resumenProfesional, 'Perfil pendiente'),
    position: offerTitle,
    education,
    experience: experienceStr,
    workHistory,
    email: candidato.email || 'email@pendiente.com',
    phone,
    location,
    skills,
    receivedDate: fecha.toLocaleDateString('es-EC'),
    status: mapApiStatus(app.estado),
    matchScore: app.matchScore,
    cvFile: candidato.cvUrl || profile.cvUrl,
  };
};

const statusBadges: Record<ApplicationStatus, { label: string; bg: string; color: string }> = {
  pending: { label: 'Pendiente', bg: '#FEF3C7', color: '#92400E' },
  review: { label: 'En Revisión', bg: '#DBEAFE', color: '#1E40AF' },
  accepted: { label: 'Aceptado', bg: '#D1FAE5', color: '#065F46' },
  rejected: { label: 'Rechazado', bg: '#FEE2E2', color: '#991B1B' },
};

interface ReceivedApplicationsScreenProps {
  searchQuery?: string;
}

export default function ReceivedApplicationsScreen({ searchQuery = '' }: ReceivedApplicationsScreenProps) {
  // Estados de datos
  const [applications, setApplications] = useState<Application[]>([]);
  const [groupedByOffer, setGroupedByOffer] = useState<{
    offerId: string;
    offerTitle: string;
    offerDetails?: { salary: string; contract: string; level: string };
    apps: Application[]
  }[]>([]);

  // Estados de UI
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const { confirm, success, error: showError, toast } = useNotifications();

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
            offerDetails: {
              salary: offer.salarioMin ? `$${offer.salarioMin} - $${offer.salarioMax}` : 'A convenir',
              contract: offer.tipoContrato || 'Tiempo completo',
              level: offer.nivelJerarquico || 'Junior'
            },
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

  const filteredGroups = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return groupedByOffer;

    return groupedByOffer
      .map((group) => ({
        ...group,
        apps: group.apps.filter(
          (app) =>
            app.candidateName.toLowerCase().includes(query) ||
            app.skills.some((s) => s.toLowerCase().includes(query)) ||
            app.position.toLowerCase().includes(query)
        ),
      }))
      .filter((group) => group.apps.length > 0);
  }, [groupedByOffer, searchQuery]);

  const openEvaluationModal = async (app: Application) => {
    setSelectedApplication(app);
    setShowEvaluationModal(true);

    // Si la postulación está pendiente, marcarla automáticamente como "En Revisión"
    if (app.status === 'pending') {
      try {
        await applicationsService.updateApplicationStatus(app.id, 'EN_REVISION');
        // Actualizar el estado local para reflejar el cambio sin recargar todo
        setApplications(prev => prev.map(a => 
          a.id === app.id ? { ...a, status: 'review' } : a
        ));
        setGroupedByOffer(prev => prev.map(group => ({
          ...group,
          apps: group.apps.map(a => a.id === app.id ? { ...a, status: 'review' } : a)
        })));
      } catch (err) {
        console.error('Error auto-updating application status to review:', err);
      }
    }
  };

  const handleSelectCandidate = async () => {
    if (!selectedApplication) return;
    try {
      const confirmed = await confirm({
        title: 'Confirmar Aceptación',
        message: `¿Estás seguro de aceptar a ${selectedApplication.candidateName}?`,
        variant: 'success',
        primaryLabel: 'Aceptar',
        secondaryLabel: 'Cancelar',
      });

      if (confirmed) {
        await applicationsService.updateApplicationStatus(selectedApplication.id, 'ACEPTADA');
        setShowEvaluationModal(false);
        setSelectedApplication(null);
        loadApplications();
      }
    } catch (err) {
      console.error('Error accepting candidate:', err);
      showError('Error al aceptar candidato. Inténtalo de nuevo.');
    }
  };

  const handleReject = async () => {
    if (!selectedApplication) return;
    try {
      const confirmed = await confirm({
        title: 'Confirmar Rechazo',
        message: `¿Estás seguro de rechazar la postulación de ${selectedApplication.candidateName}?`,
        variant: 'danger',
        primaryLabel: 'Rechazar',
        secondaryLabel: 'Cancelar',
      });

      if (confirmed) {
        await applicationsService.updateApplicationStatus(selectedApplication.id, 'RECHAZADA');
        setShowEvaluationModal(false);
        setSelectedApplication(null);
        loadApplications();
      }
    } catch (err) {
      console.error('Error rejecting candidate:', err);
      showError('Error al rechazar candidato. Inténtalo de nuevo.');
    }
  };

  // Render loading state
  if (isLoading) {
    return <LoadingSpinner message="Cargando postulaciones..." />;
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





      <div>
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => (
            group.apps.length > 0 ? (
              <div key={group.offerId} style={{ marginBottom: 24, padding: 20, borderRadius: 16, border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                <div style={{ padding: '0 0 16px 0', borderBottom: '1px solid #E5E7EB', marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#F1842D" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>{group.offerTitle}</span>
                      <span style={{ fontSize: 13, color: '#6B7280', background: '#E5E7EB', padding: '2px 8px', borderRadius: 12 }}>
                        {group.apps.length}
                      </span>
                    </div>
                    {group.offerDetails && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fff', padding: '4px 10px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12, color: '#4B5563' }}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {group.offerDetails.salary}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fff', padding: '4px 10px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12, color: '#4B5563' }}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {group.offerDetails.contract}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fff', padding: '4px 10px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12, color: '#4B5563' }}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          {group.offerDetails.level}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'grid', gap: 12 }}>
                  {group.apps.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => openEvaluationModal(app)}
                      style={{
                        background: '#fff',
                        borderRadius: 14,
                        padding: 16,
                        border: '1px solid #E5E7EB',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 14,
                              background: '#F3F4F6',
                              display: 'grid',
                              placeItems: 'center',
                              fontWeight: 700,
                              fontSize: 16,
                              color: '#4B5563',
                            }}
                          >
                            {app.initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 2 }}>{app.candidateName}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280' }}>
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {app.receivedDate}
                            </div>
                          </div>
                        </div>
                        <span
                          style={{
                            padding: '6px 14px',
                            borderRadius: 12,
                            background: statusBadges[app.status].bg,
                            color: statusBadges[app.status].color,
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {statusBadges[app.status].label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: 40, background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB' }}>
            {searchQuery ? 'No se encontraron postulaciones con los criterios de búsqueda.' : 'No hay postulaciones agrupadas. Publica ofertas para recibir candidatos.'}
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
              borderRadius: 24,
              padding: 0,
              width: 'min(760px, 94%)',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Profile Cover style */}
            <div style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)', padding: '32px 32px 24px', borderBottom: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 20,
                      background: '#fff',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 24,
                      fontWeight: 800,
                      color: '#F1842D',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.06)',
                      border: '1px solid #E5E7EB',
                    }}
                  >
                    {selectedApplication.initials}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#111827' }}>{selectedApplication.candidateName}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6B7280', fontSize: 14, marginTop: 4 }}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {selectedApplication.position}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEvaluationModal(false)}
                  style={{ 
                    border: 'none', 
                    background: '#fff', 
                    cursor: 'pointer', 
                    width: 36, 
                    height: 36, 
                    borderRadius: 10, 
                    display: 'grid', 
                    placeItems: 'center',
                    color: '#9CA3AF',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  }}
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div style={{ padding: '24px 32px 32px' }}>
              {/* Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contacto</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#374151' }}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {selectedApplication.email}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#374151' }}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {selectedApplication.phone}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ubicación y Estado</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#374151' }}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {selectedApplication.location}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 8,
                          background: statusBadges[selectedApplication.status].bg,
                          color: statusBadges[selectedApplication.status].color,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {statusBadges[selectedApplication.status].label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Summary */}
              <div style={{ marginBottom: 24, padding: 20, background: '#F9FAFB', borderRadius: 16, border: '1px solid #E5E7EB' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: 14, fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Resumen Profesional
                </h4>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#4B5563' }}>{selectedApplication.department}</p>
              </div>

              {/* Education and Experience */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                <div style={{ padding: 16, background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: 13, fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth={2}>
                      <path d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                    Educación
                  </h4>
                  <div style={{ fontSize: 14, color: '#4B5563' }}>{selectedApplication.education}</div>
                </div>
                <div style={{ padding: 16, background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB' }}>
                   <h4 style={{ margin: '0 0 8px 0', fontSize: 13, fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#6B7280" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Experiencia
                  </h4>
                  <div style={{ fontSize: 14, color: '#4B5563' }}>{selectedApplication.experience}</div>
                </div>
              </div>

              {/* Work History */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Historial Laboral
                </h4>
                {selectedApplication.workHistory && selectedApplication.workHistory.length > 0 ? (
                  <div style={{ display: 'grid', gap: 12 }}>
                    {selectedApplication.workHistory.map((job: any, idx: number) => (
                      <div key={idx} style={{ padding: 16, background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB' }}>
                        <div style={{ fontWeight: 700, color: '#111827', fontSize: 15 }}>{job.position}</div>
                        <div style={{ color: '#F1842D', fontSize: 14, fontWeight: 600, marginTop: 2 }}>{job.company}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {job.startDate} — {job.isCurrent ? 'Actualidad' : job.endDate}
                        </div>
                        {job.description && (
                          <p style={{ fontSize: 13, marginTop: 8, color: '#4B5563', lineHeight: 1.5 }}>{job.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: 20, textAlign: 'center', background: '#F9FAFB', borderRadius: 14, border: '1px dashed #D1D5DB', color: '#9CA3AF', fontSize: 13 }}>
                    Sin historial laboral detallado disponible
                  </div>
                )}
              </div>

              {/* Skills */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Habilidades
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {selectedApplication.skills.map((skill) => (
                    <span key={skill} style={{ padding: '6px 12px', borderRadius: 10, background: '#EFF6FF', color: '#1E40AF', fontSize: 13, fontWeight: 600 }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Resume File */}
              {selectedApplication.cvFile && (
                <div style={{ paddingTop: 24, borderTop: '1px solid #F3F4F6', marginBottom: 32 }}>
                   <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: '#374151' }}>Documentación</h4>
                  <a
                    href={selectedApplication.cvFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      color: '#2563EB',
                      textDecoration: 'none',
                      fontSize: 14,
                      fontWeight: 600,
                      background: '#EFF6FF',
                      padding: '12px 16px',
                      borderRadius: 12,
                      width: 'fit-content',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#DBEAFE'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#EFF6FF'}
                  >
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Ver / Descargar Hoja de Vida
                  </a>
                </div>
              )}

              {/* Action Buttons */}
              {selectedApplication.status !== 'accepted' && selectedApplication.status !== 'rejected' && (
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 24, borderTop: '1px solid #E5E7EB' }}>
                  <button
                    type="button"
                    onClick={handleReject}
                    style={{
                      padding: '12px 24px',
                      borderRadius: 12,
                      border: 'none',
                      background: '#FEF2F2',
                      color: '#DC2626',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 15,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#FEE2E2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#FEF2F2';
                    }}
                  >
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Rechazar
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectCandidate}
                    style={{
                      padding: '12px 24px',
                      borderRadius: 12,
                      border: 'none',
                      background: '#10B981',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 15,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#059669';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#10B981';
                    }}
                  >
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Aceptar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
