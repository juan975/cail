import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiCheck, FiSend, FiAward, FiBriefcase, FiTarget, FiInfo, FiAlertCircle, FiSearch } from 'react-icons/fi';
import { colors } from '../../theme/colors';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import { Chip } from '../../components/ui/Chip';
import { JobOffer } from '../../types';
import { offersService } from '../../services/offers.service';
import { applicationsService } from '../../services/applications.service';
import { Offer } from '../../types/offers.types';
import { Application, ApplicationStatusColors } from '../../types/applications.types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface FilterState {
  modality: 'Todos' | JobOffer['modality'];
}

interface JobDiscoveryScreenProps {
  searchQuery?: string;
}

const mapApiOfferToJobOffer = (offer: Offer): JobOffer => {
  // Handle Firestore Timestamp format: { _seconds, _nanoseconds }
  let fechaPub: Date;
  const rawDate = offer.fechaPublicacion as any;
  if (rawDate && typeof rawDate === 'object' && rawDate._seconds) {
    // Firestore Timestamp
    fechaPub = new Date(rawDate._seconds * 1000);
  } else if (rawDate instanceof Date) {
    fechaPub = rawDate;
  } else if (typeof rawDate === 'string' || typeof rawDate === 'number') {
    fechaPub = new Date(rawDate);
  } else {
    fechaPub = new Date(); // Fallback to current date
  }

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
    'Por Horas': 'Contrato',
  };
  return {
    id: offer.idOferta || (offer as any).id, // Handle both id formats
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
    matchScore: (offer as any).match_score,
  };
};

export function JobDiscoveryScreen({ searchQuery = '' }: JobDiscoveryScreenProps) {
  const { contentWidth } = useResponsiveLayout();
  const [filters, setFilters] = useState<FilterState>({ modality: 'Todos' });
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appliedOffers, setAppliedOffers] = useState<Map<string, Application>>(new Map());
  const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const loadOffers = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🔍 [DEBUG] loadOffers called');
      // Try to get matched (ranked) offers first
      try {
        console.log('🔍 [DEBUG] Calling getMatchedOffers...');
        const matchedOffers = await offersService.getMatchedOffers(50);
        console.log('🔍 [DEBUG] getMatchedOffers response:', matchedOffers);
        if (matchedOffers && matchedOffers.length > 0) {
          console.log('🔍 [DEBUG] First offer RAW:', JSON.stringify(matchedOffers[0], null, 2));
          console.log('🔍 [DEBUG] match_score values:', matchedOffers.map(o => (o as any).match_score));
          console.log('🔍 [DEBUG] Using matched offers, count:', matchedOffers.length);
          setOffers(matchedOffers.map(mapApiOfferToJobOffer));
          return;
        }
        console.log('🔍 [DEBUG] matchedOffers empty, falling back');
      } catch (matchError) {
        console.log('🔍 [DEBUG] Matching service error:', matchError);
        console.log('Matching service unavailable, falling back to regular offers');
      }
      // Fallback to regular offers
      console.log('🔍 [DEBUG] Calling regular getOffers...');
      const apiOffers = await offersService.getOffers({ estado: 'ACTIVA' });
      console.log('🔍 [DEBUG] Regular offers count:', apiOffers.length);
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
      // Exclude already applied offers
      if (appliedOffers.has(offer.id)) return false;

      const matchesSearch =
        searchQuery.length === 0 ||
        offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesModality = filters.modality === 'Todos' || offer.modality === filters.modality;
      return matchesSearch && matchesModality;
    });
  }, [searchQuery, filters, offers, appliedOffers]);

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
    return <LoadingSpinner message="Cargando ofertas..." color="#0B7A4D" />;
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
          <FiSearch size={100} />
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
            <FiSearch size={26} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em' }}>Descubrimiento y postulación</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>Explora las mejores oportunidades laborales para ti</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #E5E7EB' }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Filtrar ofertas</div>
        <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 12 }}>
          Busca por competencias, experiencia, formación y ubicación usando el buscador superior.
        </div>
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
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {offer.location}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {offer.modality}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {offer.salaryRange}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  <Chip label={offer.employmentType} />
                  {offer.requiredCompetencies.slice(0, 3).map((comp) => (
                    <Chip key={comp} label={comp} />
                  ))}
                </div>
                <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 12 }}>
                  <div><strong style={{ color: '#4B5563' }}>Formación:</strong> {offer.requiredEducation}</div>
                  <div><strong style={{ color: '#4B5563' }}>Experiencia:</strong> {offer.requiredExperience}</div>
                </div>
                {applied ? (
                  <div
                    style={{
                      background: '#ECFDF5',
                      padding: '12px',
                      borderRadius: 12,
                      color: '#059669',
                      fontWeight: 700,
                      textAlign: 'center',
                      fontSize: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      height: '45px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <FiCheck size={18} /> Ya postulaste a esta oferta
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
                      fontWeight: 700,
                      fontSize: 14,
                      height: '45px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
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
              borderRadius: 24,
              padding: '32px',
              maxWidth: '500px',
              width: '95%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Icon */}
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: '#ECFDF5',
              color: '#0B7A4D',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 20px'
            }}>
              <FiSend size={30} />
            </div>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Confirmar postulación</div>
              <div style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.5 }}>
                Estás por postularte a <strong style={{ color: '#111827' }}>{selectedOffer.title}</strong>.
              </div>
            </div>

            <div style={{ background: '#F8FAFC', borderRadius: 16, padding: 20, marginBottom: 24, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiInfo size={16} color="#3B82F6" /> Requisitos de la oferta
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ marginTop: 2 }}><FiAward size={14} color="#0B7A4D" /></div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#64748B' }}>Formación</div>
                    <div style={{ fontSize: 13, color: '#1F2937' }}>{selectedOffer.requiredEducation}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ marginTop: 2 }}><FiBriefcase size={14} color="#0B7A4D" /></div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#64748B' }}>Experiencia</div>
                    <div style={{ fontSize: 13, color: '#1F2937' }}>{selectedOffer.requiredExperience}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ marginTop: 2 }}><FiTarget size={14} color="#0B7A4D" /></div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#64748B' }}>Competencias claves</div>
                    <div style={{ fontSize: 13, color: '#1F2937' }}>{selectedOffer.requiredCompetencies.slice(0, 3).join(', ')}</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => setSelectedOffer(null)}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: 14,
                  border: '1px solid #E5E7EB',
                  background: '#fff',
                  color: '#374151',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 14,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={isApplying}
                style={{
                  flex: 1.5,
                  padding: '14px',
                  borderRadius: 14,
                  border: 'none',
                  background: isApplying ? '#9CA3AF' : '#0B7A4D',
                  color: '#fff',
                  cursor: isApplying ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  fontSize: 14,
                  boxShadow: isApplying ? 'none' : '0 4px 12px rgba(11, 122, 77, 0.25)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
                onMouseEnter={(e) => {
                  if (!isApplying) e.currentTarget.style.background = '#096640';
                }}
                onMouseLeave={(e) => {
                  if (!isApplying) e.currentTarget.style.background = '#0B7A4D';
                }}
              >
                {isApplying ? (
                  <>
                    <div className="spin-animation" style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} />
                    Enviando...
                  </>
                ) : (
                  <>Confirmar postulación</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
