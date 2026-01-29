import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useResponsiveLayout } from '@/hooks/useResponsive';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { JobOffer } from '@/types';
import { offersService } from '@/services/offers.service';
import { applicationsService } from '@/services/applications.service';
import { userService } from '@/services/user.service';
import { useNotifications } from '@/components/ui/Notifications';
import { Offer } from '@/types/offers.types';
import { Application, ApplicationStatusColors } from '@/types/applications.types';
import { colors } from '@/theme/colors';

interface FilterState {
  search: string;
  modality: 'Todos' | JobOffer['modality'];
  industry: 'Todos' | string;
}

// Mapeo de oferta API a tipo JobOffer del frontend
const mapApiOfferToJobOffer = (offer: Offer): JobOffer => {
  const fechaPub = offer.fechaPublicacion instanceof Date
    ? offer.fechaPublicacion
    : new Date(offer.fechaPublicacion);

  // Mapeo de modalidad
  const modalityMap: Record<string, JobOffer['modality']> = {
    'Presencial': 'Presencial',
    'Remoto': 'Remoto',
    'Híbrido': 'Híbrido',
    'Hibrido': 'Híbrido',
  };

  // Mapeo de tipo de contrato
  const employmentTypeMap: Record<string, JobOffer['employmentType']> = {
    'TIEMPO_COMPLETO': 'Tiempo completo',
    'Tiempo Completo': 'Tiempo completo',
    'Tiempo completo': 'Tiempo completo',
    'MEDIO_TIEMPO': 'Medio tiempo',
    'Medio tiempo': 'Medio tiempo',
    'CONTRATO': 'Contrato',
    'Contrato': 'Contrato',
    'FREELANCE': 'Freelance',
    'PART_TIME': 'Medio tiempo',
    'FULL_TIME': 'Tiempo completo',
  };

  return {
    id: offer.idOferta,
    title: String(offer.titulo || 'Oferta sin título'),
    company: '',
    description: String(offer.descripcion || 'Sin descripción'),
    location: String(offer.ciudad || 'Ubicación no especificada'),
    modality: modalityMap[offer.modalidad] || offer.modalidad || 'Presencial',
    salaryRange: offer.salarioMin && offer.salarioMax
      ? `$${offer.salarioMin} - $${offer.salarioMax}`
      : offer.salarioMin
        ? `$${offer.salarioMin}+`
        : 'A convenir',
    employmentType: employmentTypeMap[offer.tipoContrato] || offer.tipoContrato || 'Tiempo completo',
    industry: 'General',
    requiredCompetencies: Array.isArray(offer.competencias_requeridas) ? offer.competencias_requeridas : [],
    requiredExperience: String(offer.experiencia_requerida || 'No especificada'),
    requiredEducation: String(offer.formacion_requerida || 'No especificada'),
    professionalArea: 'General',
    economicSector: 'General',
    experienceLevel: String(offer.experiencia_requerida || 'No especificada'),
    postedDate: fechaPub instanceof Date && !isNaN(fechaPub.getTime()) 
      ? fechaPub.toLocaleDateString('es-EC') 
      : 'Reciente',
  };
};

export function JobDiscoveryScreen() {
  const { contentWidth } = useResponsiveLayout();
  const notifications = useNotifications();
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    modality: 'Todos',
    industry: 'Todos',
  });
  const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null);

  // Estados de carga y datos
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para postulaciones
  const [appliedOffers, setAppliedOffers] = useState<Map<string, Application>>(new Map());
  const [isApplying, setIsApplying] = useState(false);

  // Estado para verificar CV del usuario
  const [userCvUrl, setUserCvUrl] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Cargar ofertas del API
  const loadOffers = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // 1. Obtener todas las ofertas ACTIVAS
      const allActivePromise = offersService.getOffers({ estado: 'ACTIVA' });
      
      // 2. Intentar obtener ofertas rankeadas (matching) en paralelo
      const matchedPromise = offersService.getMatchedOffers(100).catch(() => []);

      const [allActive, matched] = await Promise.all([allActivePromise, matchedPromise]);

      // 3. Crear lookup de scores
      const scoreMap = new Map<string, number>();
      matched.forEach((mo: any) => {
        const id = mo.idOferta || mo.id;
        if (id && mo.match_score !== undefined) {
          scoreMap.set(id, mo.match_score);
        }
      });

      // 4. Transformar y enriquecer
      const mappedOffers = allActive.map((offer: Offer) => {
        const job = mapApiOfferToJobOffer(offer);
        if (scoreMap.has(job.id)) {
          job.matchScore = scoreMap.get(job.id);
        }
        return job;
      });

      // 5. Ordenar: Score (desc) y luego Fecha (desc)
      mappedOffers.sort((a: JobOffer, b: JobOffer) => {
        const scoreA = a.matchScore || 0;
        const scoreB = b.matchScore || 0;
        if (scoreB !== scoreA) return scoreB - scoreA;
        
        // Ordenar por fecha (asumiendo formato local es-EC DD/MM/YYYY)
        try {
          const partsA = a.postedDate.split('/');
          const partsB = b.postedDate.split('/');
          const timeA = new Date(`${partsA[2]}-${partsA[1]}-${partsA[0]}`).getTime();
          const timeB = new Date(`${partsB[2]}-${partsB[1]}-${partsB[0]}`).getTime();
          return timeB - timeA;
        } catch (e) {
          return 0;
        }
      });

      setOffers(mappedOffers);
    } catch (err: any) {
      console.error('Error loading offers:', err);
      setError(err.message || 'Error al cargar las ofertas');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Cargar ofertas a las que ya aplicó el usuario
  const loadAppliedOffers = useCallback(async () => {
    try {
      const appliedMap = await applicationsService.getAppliedOffersMap();
      setAppliedOffers(appliedMap);
    } catch (err) {
      console.log('Could not load applied offers:', err);
    }
  }, []);

  // Cargar perfil del usuario para verificar CV
  const loadUserProfile = useCallback(async () => {
    try {
      const profile = await userService.getProfile();
      console.log('📄 [CV CHECK] User profile loaded:', {
        hasCandidateProfile: !!profile.candidateProfile,
        cvUrl: profile.candidateProfile?.cvUrl,
      });
      setUserCvUrl(profile.candidateProfile?.cvUrl || null);
    } catch (err) {
      console.error('❌ [CV CHECK] Could not load user profile:', err);
      setUserCvUrl(null);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    loadOffers();
    loadAppliedOffers();
    loadUserProfile();
  }, [loadOffers, loadAppliedOffers, loadUserProfile]);

  const handleRefresh = () => {
    loadOffers(true);
    loadAppliedOffers();
  };

  const summary = useMemo(() => {
    const industryMap = new Map<string, number>();
    const locationMap = new Map<string, number>();
    offers.forEach((offer) => {
      industryMap.set(offer.industry, (industryMap.get(offer.industry) ?? 0) + 1);
      locationMap.set(offer.location, (locationMap.get(offer.location) ?? 0) + 1);
    });
    return {
      totalVacancies: offers.length,
      industries: industryMap.size,
      sectorBreakdown: Array.from(industryMap.entries()),
      locationBreakdown: Array.from(locationMap.entries()),
    };
  }, [offers]);

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      // 1. Excluir ofertas a las que ya se aplicó
      if (appliedOffers.has(offer.id)) return false;

      const matchesSearch =
        filters.search.length === 0 ||
        offer.title.toLowerCase().includes(filters.search.toLowerCase());
      const matchesModality = filters.modality === 'Todos' || offer.modality === filters.modality;
      const matchesIndustry = filters.industry === 'Todos' || offer.industry === filters.industry;
      return matchesSearch && matchesModality && matchesIndustry;
    });
  }, [filters, offers, appliedOffers]);

  const widthLimiter = useMemo<ViewStyle>(
    () => ({
      width: '100%',
      maxWidth: contentWidth,
      alignSelf: 'center',
    }),
    [contentWidth],
  );

  const resetModal = () => {
    setSelectedOffer(null);
  };

  const handleApply = async () => {
    if (!selectedOffer) return;

    setIsApplying(true);
    try {
      // Validar que el usuario tenga un CV subido antes de aplicar
      if (!userCvUrl || userCvUrl.trim() === '') {
        setIsApplying(false);
        resetModal();
        notifications.error('Debes subir tu CV antes de postularte a ofertas. Ve a tu perfil para cargar tu currículum.');
        return;
      }

      const application = await applicationsService.applyToOffer(selectedOffer.id);

      // Actualizar el mapa de ofertas aplicadas
      setAppliedOffers(prev => {
        const newMap = new Map(prev);
        newMap.set(selectedOffer.id, application);
        return newMap;
      });

      notifications.success(
        'Tu postulación ha sido enviada correctamente. El empleador revisará tu perfil.',
        'Postulación Exitosa'
      );
      resetModal();
    } catch (error: any) {
      if (error.status === 409) {
        notifications.alert('Ya has aplicado a esta oferta anteriormente.', 'Ya Aplicaste');
        loadAppliedOffers();
      } else if (error.status === 401) {
        notifications.alert('Por favor, inicia sesión nuevamente.', 'Sesión Expirada');
      } else {
        notifications.error(
          error.message || 'No se pudo enviar la postulación. Intenta de nuevo.',
          'Error'
        );
      }
    } finally {
      setIsApplying(false);
    }
  };

  // Verificar si ya aplicó a una oferta
  const hasApplied = (offerId: string): boolean => {
    return appliedOffers.has(offerId);
  };

  // Obtener el estado de aplicación si existe
  const getApplicationStatus = (offerId: string): Application | undefined => {
    return appliedOffers.get(offerId);
  };

  const renderOffer = ({ item }: { item: JobOffer }) => {
    const applied = hasApplied(item.id);
    const application = getApplicationStatus(item.id);
    const statusInfo = application ? ApplicationStatusColors[application.estado] : null;

    return (
      <Card style={[styles.offerCard, widthLimiter]}>
        <View style={styles.offerHeader}>
          <View style={styles.offerTitleWrap}>
            <View style={styles.titleRow}>
              <Text style={styles.offerTitle}>{item.title}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.offerDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.metaGrid}>
          <MetaItem icon="map-pin" label={item.location} />
          <MetaItem icon="briefcase" label={item.modality} />
          <MetaItem icon="dollar-sign" label={item.salaryRange} />
        </View>

        <View style={styles.tagList}>
          <Chip label={String(item.employmentType)} />
          {Array.isArray(item.requiredCompetencies) && item.requiredCompetencies.map((competency) => (
            <Chip key={String(competency)} label={String(competency)} />
          ))}
        </View>

        <View style={styles.requirementsList}>
          <RequirementItem icon="award" text={item.requiredEducation} />
          <RequirementItem icon="trending-up" text={item.requiredExperience} />
        </View>

        {applied ? (
          <View style={styles.appliedContainer}>
            <Feather name="check-circle" size={16} color="#059669" />
            <Text style={styles.appliedText}>Ya postulaste a esta oferta</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.simpleApplyBtn}
            onPress={() => setSelectedOffer(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.simpleApplyBtnText}>Postular a Oferta</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.publishDate}>Publicado: {item.postedDate || '24/10/2025'}</Text>
      </Card>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#0B7A4D" />
        <Text style={styles.loadingText}>Cargando ofertas...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Feather name="alert-circle" size={48} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadOffers()}>
          <Feather name="refresh-cw" size={16} color="#fff" />
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredOffers}
        keyExtractor={(item) => item.id}
        renderItem={renderOffer}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#0B7A4D']}
            tintColor="#0B7A4D"
          />
        }
        ListHeaderComponent={
          <View style={[styles.headerArea, widthLimiter]}>
            {/* Hero Card */}
            <Card spacing="lg" style={styles.heroCard}>
              <View style={styles.heroContent}>
                <View style={styles.heroIcon}>
                  <Feather name="search" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.heroText}>
                  <Text style={styles.heroTitle}>Descubrimiento y Postulación</Text>
                  <Text style={styles.heroSubtitle}>Explora las mejores oportunidades laborales para ti</Text>
                </View>
              </View>
            </Card>

            {/* Filters Card */}
            <Card spacing="md" style={styles.filtersCard}>
              <Text style={styles.filtersTitle}>Filtrar Ofertas</Text>
              <Text style={styles.filtersSubtitle}>
                Busca por competencias, experiencia, formación y ubicación
              </Text>

              <InputField
                tone="candidate"
                label=""
                value={filters.search}
                onChangeText={(text) => setFilters((prev) => ({ ...prev, search: text }))}
                placeholder="Buscar por experiencia, formación..."
                style={styles.searchInput}
              />

              <View style={styles.filterRow}>
                {(['Todos', 'Presencial', 'Híbrido', 'Remoto'] as FilterState['modality'][]).map((modality) => (
                  <TouchableOpacity
                    key={modality}
                    style={[
                      styles.filterChip,
                      filters.modality === modality && styles.filterChipActive
                    ]}
                    onPress={() => setFilters((prev) => ({ ...prev, modality }))}
                  >
                    <Text style={[
                      styles.filterChipText,
                      filters.modality === modality && styles.filterChipTextActive
                    ]}>
                      {modality}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.resultsText}>{filteredOffers.length} ofertas encontradas</Text>
            </Card>
          </View>
        }
        ListEmptyComponent={
          <View style={[styles.emptyState, widthLimiter]}>
            <Feather name="inbox" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No hay ofertas disponibles</Text>
            <Text style={styles.emptySubtext}>Vuelve más tarde o ajusta tus filtros</Text>
          </View>
        }
      />

      <Modal 
        visible={selectedOffer !== null} 
        animationType="slide" 
        transparent
        onRequestClose={resetModal}
      >
        <View style={styles.bottomSheetOverlay}>
          {selectedOffer && (
            <View style={styles.fullModalContent}>
              <View style={styles.fullModalHeader}>
                <View style={styles.fullModalTitleRow}>
                  <View style={styles.fullModalIconBox}>
                    <Feather name="briefcase" size={24} color="#059669" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fullModalEyebrow}>POSTULAR A</Text>
                    <Text style={styles.fullModalTitle}>{String(selectedOffer.title)}</Text>
                    <Text style={styles.fullModalSubtitle}>{String(selectedOffer.location)}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={resetModal} style={styles.fullModalCloseBtn}>
                  <Feather name="x" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.fullModalScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.fullModalBody}>
                  <View style={styles.fullConfirmBox}>
                    <Feather name="info" size={20} color="#059669" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fullConfirmTitle}>Confirmar postulación</Text>
                      <Text style={styles.fullConfirmText}>Estás por postularte a <Text style={{ fontWeight: '700' }}>{selectedOffer.title}</Text>.</Text>
                    </View>
                  </View>

                  <View style={styles.fullRequirementsBox}>
                    <View style={styles.reqHeaderRow}>
                      <Feather name="info" size={16} color="#3B82F6" />
                      <Text style={styles.fullSectionTitle}>Requisitos de la oferta</Text>
                    </View>
                    
                    <View style={styles.reqItem}>
                      <Feather name="award" size={14} color="#0B7A4D" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reqLabel}>Formación</Text>
                        <Text style={styles.reqValue}>{String(selectedOffer.requiredEducation)}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.reqItem}>
                      <Feather name="briefcase" size={14} color="#0B7A4D" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reqLabel}>Experiencia</Text>
                        <Text style={styles.reqValue}>{String(selectedOffer.requiredExperience)}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.reqItem}>
                      <Feather name="target" size={14} color="#0B7A4D" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reqLabel}>Competencias claves</Text>
                        <Text style={styles.reqValue}>{Array.isArray(selectedOffer.requiredCompetencies) ? selectedOffer.requiredCompetencies.join(', ') : ''}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.reqItem}>
                      <Feather name="clock" size={14} color="#0B7A4D" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reqLabel}>Modalidad</Text>
                        <Text style={styles.reqValue}>{String(selectedOffer.modality)} - {String(selectedOffer.employmentType)}</Text>
                      </View>
                    </View>
                  </View>


                </View>
              </ScrollView>

              <View style={styles.fullModalFooter}>
                <View style={styles.simpleModalButtons}>
                  <TouchableOpacity 
                    style={[styles.simpleBtn, styles.simpleCancelBtn]} 
                    onPress={resetModal}
                    disabled={isApplying}
                  >
                    <Text style={styles.simpleCancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.simpleBtn, styles.improvedConfirmBtn]} 
                    onPress={handleApply}
                    disabled={isApplying}
                  >
                    {isApplying ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <View style={styles.confirmButtonContent}>
                        <Feather name="check" size={18} color="#FFFFFF" />
                        <Text style={styles.improvedConfirmBtnText}>Confirmar postulación</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

function MetaItem({ icon, label }: { icon: keyof typeof Feather.glyphMap; label: string }) {
  return (
    <View style={styles.metaItem}>
      <Feather name={icon} size={14} color={colors.textSecondary} /><Text style={styles.metaText}>{label}</Text>
    </View>
  );
}

function RequirementItem({ icon, text }: { icon: keyof typeof Feather.glyphMap; text: string }) {
  return (
    <View style={styles.requirementRow}>
      <View style={styles.requirementIcon}><Feather name={icon} size={12} color={colors.danger} /></View><Text style={styles.requirementRowText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    backgroundColor: '#0B7A4D',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  listContent: {
    paddingVertical: 16,
    paddingBottom: 100,
    gap: 12,
  },
  headerArea: {
    marginBottom: 4,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },

  // Hero Card
  heroCard: {
    backgroundColor: '#0B7A4D',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },

  // Filters Card
  filtersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  filtersSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 14,
    lineHeight: 18,
  },
  searchInput: {
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F2F5',
    borderWidth: 1,
    borderColor: '#E0E4E9',
  },
  filterChipActive: {
    backgroundColor: '#0B7A4D',
    borderColor: '#0B7A4D',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  resultsText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },

  // Offer Card
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  offerHeader: {
    marginBottom: 4,
  },
  offerTitleWrap: {
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  offerDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  requirementsList: {
    gap: 6,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#FEF3F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requirementRowText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
  },
  applyButton: {
    marginTop: 4,
  },
  publishDate: {
    fontSize: 11,
    color: colors.muted,
    textAlign: 'center',
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeaderClean: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalDragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  companyLogoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0FDF4',
  },
  modalEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  modalTitleLarge: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 24,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 24,
  },
  confirmationBox: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 24,
  },
  confirmationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 4,
  },
  confirmationText: {
    fontSize: 13,
    color: '#047857',
    lineHeight: 18,
  },

  requirementsBox: {
    backgroundColor: '#F0F7FF',
    borderRadius: 8,
    padding: 14,
    gap: 10,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0052CC',
    marginBottom: 4,
  },
  requirementItem: {
    flexDirection: 'row',
    gap: 8,
  },
  requirementBullet: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0052CC',
  },
  requirementText: {
    flex: 1,
    fontSize: 12,
    color: '#0052CC',
    lineHeight: 18,
  },
  submitButton: {
    marginTop: 8,
  },
  // Applied status styles
  appliedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  appliedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  appliedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 4,
  },
  appliedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  // Confirmation modal styles

  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E4E9',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  confirmButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#0B7A4D',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Simple UI Styles
  simpleApplyBtn: {
    backgroundColor: '#0B7A4D',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  simpleApplyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  simpleModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  simpleModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    overflow: 'hidden',
  },
  simpleModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  simpleModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  simpleModalBody: {
    padding: 20,
  },
  simpleModalText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 24,
    textAlign: 'center',
  },
  simpleModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  simpleBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simpleCancelBtn: {
    borderWidth: 1,
    borderColor: '#ccc',
  },
  simpleCancelBtnText: {
    color: '#666',
    fontWeight: '600',
  },
  simpleConfirmBtn: {
    backgroundColor: '#0B7A4D',
  },
  simpleConfirmBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  improvedConfirmBtn: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  improvedConfirmBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },

  // Full Modal Styles
  fullModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  fullModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  fullModalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  fullModalIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullModalEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  fullModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  fullModalSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  fullModalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullModalScroll: {
    maxHeight: 400,
  },
  fullModalBody: {
    padding: 20,
    gap: 16,
  },
  fullConfirmBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  fullConfirmTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 4,
  },
  fullConfirmText: {
    fontSize: 13,
    color: '#047857',
    lineHeight: 18,
  },
  fullRequirementsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reqHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  fullSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  reqItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  reqLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
  },
  reqValue: {
    fontSize: 13,
    color: '#1F2937',
    marginTop: 2,
  },
  fullReqItem: {
    flexDirection: 'row',
    gap: 8,
  },
  fullReqBullet: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0052CC',
  },
  fullReqText: {
    flex: 1,
    fontSize: 13,
    color: '#0052CC',
    lineHeight: 18,
  },
  fullInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  fullInfoBox: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  fullInfoLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  fullInfoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  fullModalFooter: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
});
