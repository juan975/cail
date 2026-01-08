import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { Offer } from '@/types/offers.types';
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
    'Tiempo Completo': 'Tiempo completo',
    'Tiempo completo': 'Tiempo completo',
    'Medio tiempo': 'Medio tiempo',
    'Contrato': 'Contrato',
  };

  return {
    id: offer.idOferta,
    title: offer.titulo,
    company: offer.empresa,
    description: offer.descripcion,
    location: offer.ciudad,
    modality: modalityMap[offer.modalidad] || 'Presencial',
    salaryRange: offer.salarioMin && offer.salarioMax
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
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    modality: 'Todos',
    industry: 'Todos',
  });
  const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null);
  const [cvLink, setCvLink] = useState('');
  const [notes, setNotes] = useState('');

  // Estados de carga y datos
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar ofertas del API
  const loadOffers = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Obtener solo ofertas ACTIVAS
      const apiOffers = await offersService.getOffers({ estado: 'ACTIVA' });
      const mappedOffers = apiOffers.map(mapApiOfferToJobOffer);
      setOffers(mappedOffers);
    } catch (err: any) {
      console.error('Error loading offers:', err);
      setError(err.message || 'Error al cargar las ofertas');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const handleRefresh = () => {
    loadOffers(true);
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
      const matchesSearch =
        filters.search.length === 0 ||
        offer.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        offer.company.toLowerCase().includes(filters.search.toLowerCase());
      const matchesModality = filters.modality === 'Todos' || offer.modality === filters.modality;
      const matchesIndustry = filters.industry === 'Todos' || offer.industry === filters.industry;
      return matchesSearch && matchesModality && matchesIndustry;
    });
  }, [filters, offers]);

  const widthLimiter = useMemo<ViewStyle>(
    () => ({
      width: '100%',
      maxWidth: contentWidth,
      alignSelf: 'center',
    }),
    [contentWidth],
  );

  const resetModal = () => {
    setCvLink('');
    setNotes('');
    setSelectedOffer(null);
  };

  const handleApply = () => {
    if (!cvLink.trim()) {
      Alert.alert('Falta tu CV', 'Agrega el enlace de tu CV para continuar.');
      return;
    }
    Alert.alert('Postulación enviada', 'El empleador recibirá tu perfil y CV.');
    resetModal();
  };

  const renderOffer = ({ item }: { item: JobOffer }) => (
    <Card style={[styles.offerCard, widthLimiter]}>
      <View style={styles.offerHeader}>
        <View style={styles.offerTitleWrap}>
          <View style={styles.titleRow}>
            <Text style={styles.offerTitle}>{item.title}</Text>
            <StatusBadge label={item.hierarchyLevel} tone="success" />
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
        <Chip label={item.employmentType} />
        {item.requiredCompetencies.slice(0, 3).map((competency) => (
          <Chip key={competency} label={competency} />
        ))}
      </View>

      <View style={styles.requirementsList}>
        <RequirementItem icon="award" text={item.requiredEducation} />
        <RequirementItem icon="trending-up" text={item.requiredExperience} />
      </View>

      <Button
        label="Postular a Oferta"
        onPress={() => setSelectedOffer(item)}
        style={styles.applyButton}
      />

      <Text style={styles.publishDate}>Publicado: {item.postedDate || '24/10/2025'}</Text>
    </Card>
  );

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
                  <Text style={styles.heroSubtitle}>Catálogo de ofertas - Encuentra las mejores oportunidades</Text>
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

      {/* Modal de Postulación */}
      <Modal visible={!!selectedOffer} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>{selectedOffer?.title}</Text>
                <Text style={styles.modalSubtitle}>{selectedOffer?.location}</Text>
              </View>
              <TouchableOpacity onPress={resetModal} style={styles.closeButton}>
                <Feather name="x" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalBody}>
                <Text style={styles.modalLabel}>Curriculum Vitae (CV) *</Text>
                <TouchableOpacity style={styles.fileSelector}>
                  <Text style={styles.fileSelectorText}>
                    {cvLink || 'Seleccionar archivo Ningún ar...leccionado'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.modalHelper}>Formatos: PDF, DOC, DOCX</Text>

                <Text style={styles.modalLabel}>Carta de Presentación (Opcional)</Text>
                <InputField
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Escribe una breve carta de presentación..."
                  multiline
                  style={styles.textArea}
                />

                {selectedOffer && (
                  <View style={styles.requirementsBox}>
                    <Text style={styles.requirementsTitle}>Requisitos de la oferta:</Text>
                    <View style={styles.requirementItem}>
                      <Text style={styles.requirementBullet}>•</Text>
                      <Text style={styles.requirementText}>
                        Formación: {selectedOffer.requiredEducation}
                      </Text>
                    </View>
                    <View style={styles.requirementItem}>
                      <Text style={styles.requirementBullet}>•</Text>
                      <Text style={styles.requirementText}>
                        Experiencia: {selectedOffer.requiredExperience}
                      </Text>
                    </View>
                    <View style={styles.requirementItem}>
                      <Text style={styles.requirementBullet}>•</Text>
                      <Text style={styles.requirementText}>
                        Competencias: {selectedOffer.requiredCompetencies.slice(0, 3).join(', ')}
                      </Text>
                    </View>
                  </View>
                )}

                <Button
                  label="Enviar Postulación"
                  onPress={handleApply}
                  style={styles.submitButton}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function MetaItem({ icon, label }: { icon: keyof typeof Feather.glyphMap; label: string }) {
  return (
    <View style={styles.metaItem}>
      <Feather name={icon} size={14} color={colors.textSecondary} />
      <Text style={styles.metaText}>{label}</Text>
    </View>
  );
}

function RequirementItem({ icon, text }: { icon: keyof typeof Feather.glyphMap; text: string }) {
  return (
    <View style={styles.requirementRow}>
      <View style={styles.requirementIcon}>
        <Feather name={icon} size={12} color={colors.danger} />
      </View>
      <Text style={styles.requirementRowText}>{text}</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    gap: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  fileSelector: {
    backgroundColor: '#F8FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E4E9',
    borderStyle: 'dashed',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  fileSelectorText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalHelper: {
    fontSize: 12,
    color: colors.muted,
    marginTop: -8,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
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
});
