import { useCallback, useEffect, useState } from 'react';
import { colors } from '../../theme/colors';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import { applicationsService } from '../../services/applications.service';
import { FiBriefcase, FiMapPin, FiCalendar, FiClock, FiEye, FiCheckCircle, FiXCircle, FiInbox, FiRefreshCw, FiAward, FiExternalLink } from 'react-icons/fi';
import { ApplicationWithOffer, ApplicationStatus, ApplicationStatusColors } from '../../types/applications.types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface MyApplicationsScreenProps {
  searchQuery?: string;
}

export function MyApplicationsScreen({ searchQuery = '' }: MyApplicationsScreenProps) {
  const { contentWidth } = useResponsiveLayout();
  const [applications, setApplications] = useState<ApplicationWithOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadApplications = useCallback(async (showRefresh = false) => {
    try {
      showRefresh ? setIsRefreshing(true) : setIsLoading(true);
      const data = await applicationsService.getMyApplicationsWithOffers();
      setApplications(data);
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const formatDate = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusIcon = (estado: ApplicationStatus) => {
    switch (estado) {
      case 'ACEPTADA':
        return <FiCheckCircle size={14} />;
      case 'RECHAZADA':
        return <FiXCircle size={14} />;
      case 'EN_REVISION':
        return <FiEye size={14} />;
      default:
        return <FiClock size={14} />;
    }
  };

  const filteredApplications = applications.filter((app: ApplicationWithOffer) => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    return (
      app.oferta?.titulo.toLowerCase().includes(term)
    );
  });

  const stats = {
    total: filteredApplications.length,
    pending: filteredApplications.filter((app: ApplicationWithOffer) => app.estado === 'PENDIENTE').length,
    review: filteredApplications.filter((app: ApplicationWithOffer) => app.estado === 'EN_REVISION').length,
    accepted: filteredApplications.filter((app: ApplicationWithOffer) => app.estado === 'ACEPTADA').length,
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando postulaciones..." color="#0B7A4D" />;
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0B7A4D 0%, #065F46 100%)',
          borderRadius: 20,
          padding: '24px',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          boxShadow: '0 8px 16px rgba(11, 122, 77, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', right: '-15px', top: '-15px', opacity: 0.1, color: '#fff' }}>
          <FiBriefcase size={100} />
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center', zIndex: 1 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <FiBriefcase size={26} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em' }}>Mis Postulaciones</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>Sigue el estado de tus aplicaciones en tiempo real</div>
          </div>
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
          <div style={{ fontSize: 12, color: colors.textSecondary }}>Pendientes</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 14, padding: 14, border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#3B82F6' }}>{stats.review}</div>
          <div style={{ fontSize: 12, color: colors.textSecondary }}>En revisión</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 14, padding: 14, border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#10B981' }}>{stats.accepted}</div>
          <div style={{ fontSize: 12, color: colors.textSecondary }}>Aceptadas</div>
        </div>
      </div>

      {/* Applications */}
      <div style={{ display: 'grid', gap: 12 }}>
        {filteredApplications.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px', 
            background: '#fff', 
            borderRadius: 16, 
            border: '1px solid #E5E7EB',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16
          }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: '#F3F4F6', display: 'grid', placeItems: 'center', color: '#9CA3AF' }}>
              <FiInbox size={32} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1F2937' }}>No se encontraron postulaciones</div>
              <div style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>Intenta con otro término de búsqueda o ajusta tus filtros.</div>
            </div>
          </div>
        ) : (
          filteredApplications.map((item: ApplicationWithOffer) => {
            const statusInfo = ApplicationStatusColors[item.estado];
            return (
              <div 
                key={item.idAplicacion} 
                style={{ 
                  background: '#fff', 
                  borderRadius: 16, 
                  padding: '20px', 
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  display: 'grid',
                  gap: 16
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                  e.currentTarget.style.borderColor = '#0B7A4D40';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'grid', placeItems: 'center', color: '#0B7A4D' }}>
                      <FiBriefcase size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', marginBottom: 2 }}>{item.oferta?.titulo || 'Oferta'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748B' }}>
                          <FiMapPin size={12} /> {item.oferta?.ciudad || '-'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748B' }}>
                          <FiClock size={12} /> {item.oferta?.modalidad || '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: 999,
                      background: statusInfo.bg,
                      color: statusInfo.text,
                      fontSize: 12,
                      fontWeight: 700,
                      boxShadow: `0 2px 4px ${statusInfo.bg}40`,
                    }}
                  >
                    {getStatusIcon(item.estado)} {statusInfo.label}
                  </span>
                </div>

                {item.oferta?.descripcion && (
                  <div style={{ 
                    fontSize: 13, 
                    color: '#475569', 
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {item.oferta.descripcion}
                  </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: '#F8FAFC', borderRadius: 8, fontSize: 12, color: '#475569', border: '1px solid #F1F5F9' }}>
                    <FiAward size={14} color="#0B7A4D" />
                    <span>{item.oferta?.tipoContrato || 'Contrato'}</span>
                  </div>
                  {(item.oferta?.salarioMin || item.oferta?.salarioMax) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: '#F8FAFC', borderRadius: 8, fontSize: 12, color: '#475569', border: '1px solid #F1F5F9' }}>
                      <span style={{ color: '#059669', fontWeight: 700 }}>$</span>
                      <span>
                        {item.oferta.salarioMin && item.oferta.salarioMax 
                          ? `${item.oferta.salarioMin} - ${item.oferta.salarioMax}`
                          : item.oferta.salarioMin || item.oferta.salarioMax
                        }
                      </span>
                    </div>
                  )}
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94A3B8' }}>
                    <FiCalendar size={13} />
                    <span>Aplicado el {formatDate(item.fechaAplicacion)}</span>
                  </div>
                </div>

                <div style={{ paddingTop: 12, borderTop: '1px solid #F1F5F9', marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0B7A4D',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 8px',
                      borderRadius: 6,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#E1F4EB'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    Detalles de la oferta <FiExternalLink size={14} />
                  </button>
                </div>
              </div>
          );
        })
      )}
      </div>

      <button
        type="button"
        onClick={() => loadApplications(true)}
        style={{
          border: 'none',
          background: 'transparent',
          color: '#0B7A4D',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          margin: '0 auto',
          padding: '12px 24px',
          borderRadius: 12,
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#E1F4EB'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <FiRefreshCw className={isRefreshing ? 'spin-animation' : ''} />
        {isRefreshing ? 'Actualizando...' : 'Actualizar listado'}
      </button>
    </div>
  );
}
