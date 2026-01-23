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

  const renderApplication = ({ item }: { item: ApplicationWithOffer }) => {
    const statusInfo = ApplicationStatusColors[item.estado];

    return (
      <Card style={[styles.applicationCard, widthLimiter]}>
        <View style={styles.cardHeader}>
          <View style={styles.offerInfo}>
            <Text style={styles.offerTitle}>{item.oferta?.titulo || 'Oferta'}</Text>
            <Text style={styles.companyName}>{item.oferta?.empresa || '-'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Feather name={getStatusIcon(item.estado)} size={12} color={statusInfo.text} />
            <Text style={[styles.statusText, { color: statusInfo.text }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Feather name="map-pin" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{item.oferta?.ciudad || '-'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="briefcase" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{item.oferta?.modalidad || '-'}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.dateInfo}>
            <Feather name="calendar" size={12} color={colors.muted} />
            <Text style={styles.dateText}>
              Aplicado: {formatDate(item.fechaAplicacion)}
            </Text>
          </View>
          {item.matchScore !== undefined && (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Match:</Text>
              <Text style={styles.scoreValue}>{item.matchScore}%</Text>
            </View>
          )}
        </View>
      </Card>
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
    borderRadius: 12,
    padding: 16,
    alignSelf: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  offerInfo: {
    flex: 1,
    marginRight: 12,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: colors.muted,
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
});
