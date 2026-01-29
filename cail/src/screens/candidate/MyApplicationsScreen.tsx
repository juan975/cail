/**
 * MyApplicationsScreen
 * Pantalla donde el candidato ve el historial de sus postulaciones
 * Conectado al API real del microservicio matching
 */

import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  DimensionValue,
  Modal,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useResponsiveLayout } from '@/hooks/useResponsive';
import { Card } from '@/components/ui/Card';
import { applicationsService } from '@/services/applications.service';
import {
  ApplicationWithOffer,
  ApplicationStatus,
  ApplicationStatusColors
} from '@/types/applications.types';
import { colors } from '@/theme/colors';

export function MyApplicationsScreen() {
  const { contentWidth } = useResponsiveLayout();
  const widthLimiter: ViewStyle = {
    width: '100%' as DimensionValue,
    maxWidth: contentWidth,
    alignSelf: 'center',
  };

  const [applications, setApplications] = useState<ApplicationWithOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithOffer | null>(null);

  const loadApplications = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const data = await applicationsService.getMyApplicationsWithOffers();
      setApplications(data);
    } catch (err: any) {
      console.error('Error loading applications:', err);
      if (err.status === 401) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else {
        setError(err.message || 'Error al cargar las postulaciones');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleRefresh = () => {
    loadApplications(true);
  };

  const formatDate = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusIcon = (estado: ApplicationStatus): keyof typeof Feather.glyphMap => {
    switch (estado) {
      case 'ACEPTADA':
        return 'check-circle';
      case 'RECHAZADA':
        return 'x-circle';
      case 'EN_REVISION':
        return 'eye';
      default:
        return 'clock';
    }
  };

  const formatContractType = (type?: string) => {
    if (!type) return 'No especificado';
    return type.toLowerCase().replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const renderApplication = ({ item }: { item: ApplicationWithOffer }) => {
    const statusInfo = ApplicationStatusColors[item.estado];

    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => setSelectedApplication(item)}
      >
        <Card style={[styles.applicationCard, widthLimiter]}>
          {/* Header with icon, title and status */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.iconContainer}>
                <Feather name="briefcase" size={22} color="#0B7A4D" />
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.offerTitle}>{item.oferta?.titulo || 'Oferta'}</Text>
                <View style={styles.metaRow}>
                  <Feather name="map-pin" size={12} color="#64748B" />
                  <Text style={styles.metaText}>{item.oferta?.ciudad || '-'}</Text>
                  <Feather name="clock" size={12} color="#64748B" style={{ marginLeft: 12 }} />
                  <Text style={styles.metaText}>{item.oferta?.modalidad || '-'}</Text>
                </View>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
              <Feather name={getStatusIcon(item.estado)} size={12} color={statusInfo.text} />
              <Text style={[styles.statusText, { color: statusInfo.text }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>

          {/* Description */}
          {(item.oferta as any)?.descripcion && (
            <Text style={styles.description} numberOfLines={2}>
              {(item.oferta as any).descripcion}
            </Text>
          )}

          {/* Footer with contract type, salary and date */}
          <View style={styles.cardFooter}>
            <View style={styles.badgesRow}>
              <View style={styles.infoBadge}>
                <Feather name="award" size={14} color="#0B7A4D" />
                <Text style={styles.infoBadgeText}>
                  {formatContractType((item.oferta as any)?.tipoContrato)}
                </Text>
              </View>
              {((item.oferta as any)?.salarioMin || (item.oferta as any)?.salarioMax) && (
                <View style={styles.infoBadge}>
                  <Text style={styles.salarySymbol}>$</Text>
                  <Text style={styles.infoBadgeText}>
                    {(item.oferta as any).salarioMin && (item.oferta as any).salarioMax
                      ? `${(item.oferta as any).salarioMin} - ${(item.oferta as any).salarioMax}`
                      : (item.oferta as any).salarioMin || (item.oferta as any).salarioMax}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.dateInfo}>
              <Feather name="calendar" size={13} color="#94A3B8" />
              <Text style={styles.dateText}>
                Aplicado el {formatDate(item.fechaAplicacion)}
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#0B7A4D" />
        <Text style={styles.loadingText}>Cargando postulaciones...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Feather name="alert-circle" size={48} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadApplications()}>
          <Feather name="refresh-cw" size={16} color="#fff" />
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={applications}
        keyExtractor={(item) => item.idAplicacion}
        renderItem={renderApplication}
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
          <View style={[styles.header, widthLimiter]}>
            <Card spacing="lg" style={styles.heroCard}>
              <View style={styles.heroContent}>
                <View style={styles.heroIcon}>
                  <Feather name="file-text" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.heroText}>
                  <Text style={styles.heroTitle}>Mis Postulaciones</Text>
                  <Text style={styles.heroSubtitle}>
                    Historial de ofertas a las que has aplicado
                  </Text>
                </View>
              </View>
            </Card>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{applications.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                  {applications.filter(a => a.estado === 'PENDIENTE').length}
                </Text>
                <Text style={styles.statLabel}>Pendientes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#3B82F6' }]}>
                  {applications.filter(a => a.estado === 'EN_REVISION').length}
                </Text>
                <Text style={styles.statLabel}>En revisión</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#10B981' }]}>
                  {applications.filter(a => a.estado === 'ACEPTADA').length}
                </Text>
                <Text style={styles.statLabel}>Aceptadas</Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={[styles.emptyState, widthLimiter]}>
            <Feather name="inbox" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No tienes postulaciones</Text>
            <Text style={styles.emptySubtitle}>
              Explora las ofertas disponibles y postula a las que te interesen
            </Text>
          </View>
        }
      />

      {/* Modal de Detalles de Oferta - Bottom Sheet Style */}
      <Modal
        visible={selectedApplication !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedApplication(null)}
      >
        <View style={styles.bottomSheetOverlay}>
          {selectedApplication && (
            <View style={styles.bottomSheetContent}>
              <View style={styles.bottomSheetHeader}>
                <View style={styles.bottomSheetTitleRow}>
                  <View style={styles.bottomSheetIconBox}>
                    <Feather name="briefcase" size={24} color="#059669" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bottomSheetEyebrow}>DETALLES DE POSTULACIÓN</Text>
                    <Text style={styles.bottomSheetTitle}>{selectedApplication.oferta?.titulo || 'Oferta'}</Text>
                    <Text style={styles.bottomSheetSubtitle}>{selectedApplication.oferta?.ciudad || ''}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setSelectedApplication(null)} style={styles.bottomSheetCloseBtn}>
                  <Feather name="x" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.bottomSheetScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.bottomSheetBody}>
                  {/* Description */}
                  {(selectedApplication.oferta as any)?.descripcion && (
                    <View style={styles.descriptionBox}>
                      <Text style={styles.descriptionTitle}>Descripción del puesto</Text>
                      <Text style={styles.descriptionText}>
                        {(selectedApplication.oferta as any).descripcion}
                      </Text>
                    </View>
                  )}

                  {/* Requirements */}
                  <View style={styles.requirementsBox}>
                    <View style={styles.reqHeaderRow}>
                      <Feather name="info" size={16} color="#3B82F6" />
                      <Text style={styles.requirementsTitle}>Requisitos y Detalles</Text>
                    </View>
                    
                    <View style={styles.reqItem}>
                      <Feather name="map-pin" size={14} color="#0B7A4D" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reqLabel}>Ubicación</Text>
                        <Text style={styles.reqValue}>{selectedApplication.oferta?.ciudad || 'N/A'}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.reqItem}>
                      <Feather name="clock" size={14} color="#0B7A4D" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reqLabel}>Modalidad</Text>
                        <Text style={styles.reqValue}>
                          {selectedApplication.oferta?.modalidad || 'N/A'} - {formatContractType((selectedApplication.oferta as any)?.tipoContrato)}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.reqItem}>
                      <Feather name="briefcase" size={14} color="#0B7A4D" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reqLabel}>Experiencia</Text>
                        <Text style={styles.reqValue}>{(selectedApplication.oferta as any)?.experiencia_requerida || 'N/A'}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.reqItem}>
                      <Feather name="award" size={14} color="#0B7A4D" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reqLabel}>Formación</Text>
                        <Text style={styles.reqValue}>{(selectedApplication.oferta as any)?.formacion_requerida || 'N/A'}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.reqItem}>
                      <Feather name="dollar-sign" size={14} color="#0B7A4D" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reqLabel}>Salario</Text>
                        <Text style={[styles.reqValue, { color: '#059669' }]}>
                          {(selectedApplication.oferta as any)?.salarioMin 
                            ? `$${(selectedApplication.oferta as any).salarioMin} - $${(selectedApplication.oferta as any).salarioMax}`
                            : 'A convenir'}
                        </Text>
                      </View>
                    </View>
                    
                    {(selectedApplication.oferta as any)?.competencias_requeridas && 
                     (selectedApplication.oferta as any).competencias_requeridas.length > 0 && (
                      <View style={styles.reqItem}>
                        <Feather name="target" size={14} color="#0B7A4D" />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.reqLabel}>Competencias claves</Text>
                          <Text style={styles.reqValue}>
                            {(selectedApplication.oferta as any).competencias_requeridas.join(', ')}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>
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
  header: {
    marginBottom: 8,
    alignSelf: 'center',
    width: '100%',
  },
  heroCard: {
    backgroundColor: '#0B7A4D',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignSelf: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  offerInfo: {
    flex: 1,
    marginRight: 12,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19.5,
    marginBottom: 16,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
  },
  cardFooter: {
    flexDirection: 'column',
    gap: 16,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    alignItems: 'center',
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoBadgeText: {
    fontSize: 12,
    color: '#475569',
  },
  salarySymbol: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B7A4D',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 20,
    alignSelf: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  // Bottom Sheet Modal Styles
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  bottomSheetTitleRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    flex: 1,
  },
  bottomSheetIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheetEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  bottomSheetSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  bottomSheetCloseBtn: {
    padding: 4,
  },
  bottomSheetScroll: {
    maxHeight: '100%',
  },
  bottomSheetBody: {
    padding: 20,
    gap: 20,
  },
  descriptionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 21,
  },
  requirementsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 16,
  },
  reqHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  requirementsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  reqItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  reqLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  reqValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
});
