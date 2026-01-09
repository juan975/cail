import { useCallback, useEffect, useState } from 'react';
import { colors } from '../../theme/colors';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import { applicationsService } from '../../services/applications.service';
import { ApplicationWithOffer, ApplicationStatus, ApplicationStatusColors } from '../../types/applications.types';

export function MyApplicationsScreen() {
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
        return '●';
      case 'RECHAZADA':
        return '●';
      case 'EN_REVISION':
        return '👀';
      default:
        return '⏳';
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter((app) => app.estado === 'PENDIENTE').length,
    review: applications.filter((app) => app.estado === 'EN_REVISION').length,
    accepted: applications.filter((app) => app.estado === 'ACEPTADA').length,
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ color: '#6B7280' }}>Cargando postulaciones...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Header */}
      <div
        style={{
          background: '#0B7A4D',
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Mis postulaciones</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>Historial de ofertas aplicadas</div>
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
        {applications.map((item) => {
          const statusInfo = ApplicationStatusColors[item.estado];
          return (
            <div key={item.idAplicacion} style={{ background: '#fff', borderRadius: 14, padding: 14, border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{item.oferta?.titulo || 'Oferta'}</div>
                  <div style={{ fontSize: 13, color: colors.textSecondary }}>{item.oferta?.empresa || '-'}</div>
                </div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 8px',
                    borderRadius: 12,
                    background: statusInfo.bg,
                    color: statusInfo.text,
                    fontSize: 11,
                    fontWeight: 600,
                    height: 'fit-content',
                  }}
                >
                  {getStatusIcon(item.estado)} {statusInfo.label}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12, color: colors.textSecondary, marginBottom: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {item.oferta?.ciudad || '-'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {item.oferta?.modalidad || '-'}
                </span>
              </div>

              <div style={{ fontSize: 12, color: colors.muted }}>
                📅 Aplicado: {formatDate(item.fechaAplicacion)}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => loadApplications(true)}
        style={{
          border: 'none',
          background: 'transparent',
          color: '#0B7A4D',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        {isRefreshing ? 'Actualizando...' : 'Actualizar'}
      </button>
    </div>
  );
}
