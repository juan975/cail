import { useCallback, useEffect, useMemo, useState } from 'react';
import { colors } from '../../theme/colors';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import { Chip } from '../../components/ui/Chip';
import { JobOffer } from '../../types';
import { offersService } from '../../services/offers.service';
import { applicationsService } from '../../services/applications.service';
import { Offer } from '../../types/offers.types';
import { Application, ApplicationStatusColors } from '../../types/applications.types';

interface FilterState {
  search: string;
  modality: 'Todos' | JobOffer['modality'];
}

const mapApiOfferToJobOffer = (offer: Offer): JobOffer => {
  const fechaPub = offer.fechaPublicacion instanceof Date ? offer.fechaPublicacion : new Date(offer.fechaPublicacion);
  const modalityMap: Record<string, JobOffer['modality']> = {
    Presencial: 'Presencial',
    Remoto: 'Remoto',
    'Híbrido': 'Híbrido',
    Hibrido: 'Híbrido',
  };
  const employmentTypeMap: Record<string, JobOffer['employmentType']> = {
    'Tiempo Completo': 'Tiempo completo',
    'Tiempo completo': 'Tiempo completo',
    'Medio tiempo': 'Medio tiempo',
    Contrato: 'Contrato',
  };
  return {
    id: offer.idOferta,
    title: offer.titulo,
    company: offer.empresa,
    description: offer.descripcion,
    location: offer.ciudad,
    modality: modalityMap[offer.modalidad] || 'Presencial',
    salaryRange:
      offer.salarioMin && offer.salarioMax
        ? `$${offer.salarioMin} - $${offer.salarioMax}`
        : offer.salarioMin
        ? `$${offer.salarioMin}+`
        : 'A convenir',
    employmentType: employmentTypeMap[offer.tipoContrato] || 'Tiempo completo',
    industry: offer.empresa || 'General',
    hierarchyLevel: 'Semi-Senior',
    requiredCompetencies: offer.competencias_requeridas || [],
    requiredExperience: offer.experiencia_requerida || 'No especificada',
    requiredEducation: offer.formacion_requerida || 'No especificada',
    professionalArea: offer.empresa || 'General',
    economicSector: offer.empresa || 'General',
    experienceLevel: offer.experiencia_requerida || 'No especificada',
    postedDate: fechaPub.toLocaleDateString('es-EC'),
  };
};

export function JobDiscoveryScreen() {
  const { contentWidth } = useResponsiveLayout();
  const [filters, setFilters] = useState<FilterState>({ search: '', modality: 'Todos' });
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appliedOffers, setAppliedOffers] = useState<Map<string, Application>>(new Map());
  const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const loadOffers = useCallback(async () => {
    try {
      setIsLoading(true);
      const apiOffers = await offersService.getOffers({ estado: 'ACTIVA' });
      setOffers(apiOffers.map(mapApiOfferToJobOffer));
    } catch (err) {
      console.error('Error loading offers:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadAppliedOffers = useCallback(async () => {
    try {
      const appliedMap = await applicationsService.getAppliedOffersMap();
      setAppliedOffers(appliedMap);
    } catch (err) {
      console.log('Could not load applied offers:', err);
    }
  }, []);

  useEffect(() => {
    loadOffers();
    loadAppliedOffers();
  }, [loadOffers, loadAppliedOffers]);

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const matchesSearch =
        filters.search.length === 0 ||
        offer.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        offer.company.toLowerCase().includes(filters.search.toLowerCase());
      const matchesModality = filters.modality === 'Todos' || offer.modality === filters.modality;
      return matchesSearch && matchesModality;
    });
  }, [filters, offers]);

  const handleApply = async () => {
    if (!selectedOffer) return;
    setIsApplying(true);
    try {
      const application = await applicationsService.applyToOffer(selectedOffer.id);
      setAppliedOffers((prev) => {
        const newMap = new Map(prev);
        newMap.set(selectedOffer.id, application);
        return newMap;
      });
      setSelectedOffer(null);
      // Recargar ofertas aplicadas
      loadAppliedOffers();
    } catch (error: any) {
      if (error.status === 409) {
        loadAppliedOffers();
        setSelectedOffer(null);
      } else {
        console.error('Error al postular:', error);
        setSelectedOffer(null);
      }
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ color: '#6B7280' }}>Cargando ofertas...</div>
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Descubrimiento y postulación</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>Catálogo de ofertas activas</div>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #E5E7EB' }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Filtrar ofertas</div>
        <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 12 }}>
          Busca por competencias, experiencia, formación y ubicación.
        </div>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          placeholder="Buscar por experiencia, formación..."
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: '18px',
            border: '1px solid #DFE7F5',
            fontSize: '15px',
            marginBottom: '12px',
          }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(['Todos', 'Presencial', 'Híbrido', 'Remoto'] as FilterState['modality'][]).map((modality) => (
            <button
              key={modality}
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, modality }))}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: `1px solid ${filters.modality === modality ? '#0B7A4D' : '#E0E4E9'}`,
                background: filters.modality === modality ? '#0B7A4D' : '#F0F2F5',
                color: filters.modality === modality ? '#fff' : colors.textSecondary,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {modality}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 12 }}>
          {filteredOffers.length} ofertas encontradas
        </div>
        <button
          type="button"
          onClick={() => {
            loadOffers();
            loadAppliedOffers();
          }}
          style={{
            marginTop: 10,
            border: 'none',
            background: 'transparent',
            color: '#0B7A4D',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Actualizar listado
        </button>
      </div>

      {/* Ofertas */}
      {filteredOffers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#6B7280' }}>No hay ofertas disponibles</div>
          <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Vuelve más tarde o ajusta tus filtros</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {filteredOffers.map((offer) => {
          const applied = appliedOffers.has(offer.id);
          const application = appliedOffers.get(offer.id);
          const statusInfo = application ? ApplicationStatusColors[application.estado] : null;
          return (
            <div key={offer.id} style={{ background: '#fff', borderRadius: 14, padding: 14, border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{offer.title}</div>
                {applied && statusInfo && (
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: 999,
                      background: statusInfo.bg,
                      color: statusInfo.text,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {statusInfo.label}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>{offer.description}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12, color: colors.textSecondary, marginBottom: 8 }}>
                <span>📍 {offer.location}</span>
                <span>💼 {offer.modality}</span>
                <span>💰 {offer.salaryRange}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                <Chip label={offer.employmentType} />
                {offer.requiredCompetencies.slice(0, 3).map((comp) => (
                  <Chip key={comp} label={comp} />
                ))}
              </div>
              <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 12 }}>
                <div>Formación: {offer.requiredEducation}</div>
                <div>Experiencia: {offer.requiredExperience}</div>
              </div>
              {applied ? (
                <div
                  style={{
                    background: '#ECFDF5',
                    padding: '10px 12px',
                    borderRadius: 12,
                    color: '#059669',
                    fontWeight: 600,
                    textAlign: 'center',
                  }}
                >
                  ✓ Ya postulaste a esta oferta
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedOffer(offer)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 12,
                    border: 'none',
                    background: '#0B7A4D',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Postular a oferta
                </button>
              )}
              <div style={{ fontSize: 11, color: colors.muted, textAlign: 'center', marginTop: 8 }}>
                Publicado: {offer.postedDate}
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Modal de confirmación */}
      {selectedOffer && (
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
              borderRadius: 20,
              padding: 24,
              maxWidth: '500px',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>📨</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Confirmar postulación</div>
              <div style={{ fontSize: 14, color: colors.textSecondary }}>
                ¿Deseas postularte a {selectedOffer.title}?
              </div>
            </div>

            <div style={{ background: '#F0F7FF', borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0052CC', marginBottom: 8 }}>
                Requisitos de la oferta:
              </div>
              <div style={{ fontSize: 12, color: '#0052CC' }}>• Formación: {selectedOffer.requiredEducation}</div>
              <div style={{ fontSize: 12, color: '#0052CC' }}>• Experiencia: {selectedOffer.requiredExperience}</div>
              <div style={{ fontSize: 12, color: '#0052CC' }}>
                • Competencias: {selectedOffer.requiredCompetencies.slice(0, 3).join(', ')}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => setSelectedOffer(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 12,
                  border: '1px solid #E5E7EB',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={isApplying}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 12,
                  border: 'none',
                  background: isApplying ? '#9CA3AF' : '#0B7A4D',
                  color: '#fff',
                  cursor: isApplying ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                }}
              >
                {isApplying ? 'Enviando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
