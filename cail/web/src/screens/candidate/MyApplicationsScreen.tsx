import { useCallback, useEffect, useState } from 'react';
import { colors } from '../../theme/colors';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import { applicationsService } from '../../services/applications.service';
import { FiBriefcase, FiMapPin, FiCalendar, FiClock, FiEye, FiCheckCircle, FiXCircle, FiInbox, FiRefreshCw, FiAward, FiExternalLink } from 'react-icons/fi';
import { ApplicationWithOffer, ApplicationStatus, ApplicationStatusColors } from '../../types/applications.types';
import { Offer } from '../../types/offers.types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface MyApplicationsScreenProps {
  searchQuery?: string;
}

export function MyApplicationsScreen({ searchQuery = '' }: MyApplicationsScreenProps) {
  const { contentWidth } = useResponsiveLayout();
  const [applications, setApplications] = useState<ApplicationWithOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

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
                    onClick={() => setSelectedOffer(item.oferta)}
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
                    onMouseEnter={(e: any) => e.currentTarget.style.background = '#E1F4EB'}
                    onMouseLeave={(e: any) => e.currentTarget.style.background = 'none'}
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

      {/* DETALLES DE OFERTA MODAL */}
      {
        selectedOffer && (
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
            onClick={() => setSelectedOffer(null)}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 24,
                padding: '32px',
                maxWidth: '600px',
                width: '95%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'grid', placeItems: 'center', color: '#0B7A4D' }}>
                    <FiBriefcase size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>{selectedOffer.titulo}</div>
                    <div style={{ color: '#64748B', fontSize: 14 }}>{selectedOffer.empresa || 'Empresa Confidencial'}</div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOffer(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
                >
                  <FiXCircle size={24} />
                </button>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0B7A4D', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Descripción del puesto</div>
                <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {selectedOffer.descripcion}
                </div>
              </div>

              <div style={{ background: '#F8FAFC', borderRadius: 16, padding: 24, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', marginBottom: 16 }}>Requisitos y Detalles</div>

                <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>Modalidad</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>{selectedOffer.modalidad}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>Ubicación</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>{selectedOffer.ciudad}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>Experiencia Requ.</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>{selectedOffer.experiencia_requerida || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>Salario</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#059669' }}>
                      {selectedOffer.salarioMin ? `$${selectedOffer.salarioMin} - $${selectedOffer.salarioMax}` : 'A convenir'}
                    </div>
                  </div>
                </div>

                {selectedOffer.habilidades_obligatorias && selectedOffer.habilidades_obligatorias.length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <div style={{ fontSize: 12, color: '#64748B', marginBottom: 8 }}>Habilidades Técnicas</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {selectedOffer.habilidades_obligatorias.map((h: any, i: number) => (
                        <span key={i} style={{
                          background: '#fff',
                          border: '1px solid #E5E7EB',
                          padding: '6px 12px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#475569'
                        }}>
                          {h.nombre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #F1F5F9', textAlign: 'right' }}>
                <button
                  onClick={() => setSelectedOffer(null)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 12,
                    background: '#0B7A4D',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 14
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
