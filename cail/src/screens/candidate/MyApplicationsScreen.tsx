import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { colors } from '@/theme/colors';
import { CANDIDATE_APPLICATIONS } from '@/data/mockData';
import { useResponsiveLayout } from '@/hooks/useResponsive';

const statusTone: Record<
  string,
  {
    label: string;
    tone: 'info' | 'warning' | 'success' | 'danger' | 'neutral';
    accent: string;
    background: string;
    note?: string;
  }
> = {
  postulado: {
    label: 'Postulado',
    tone: 'neutral',
    accent: '#6B7280',
    background: '#F3F4F6',
    note: 'Tu postulación ha sido recibida y está pendiente de revisión.',
  },
  revision: {
    label: 'En revisión',
    tone: 'warning',
    accent: '#F59E0B',
    background: '#FFF7E6',
    note: 'El empleador está revisando tu perfil.',
  },
  entrevista: {
    label: 'Entrevista',
    tone: 'info',
    accent: '#3B82F6',
    background: '#EFF6FF',
    note: 'Tienes una entrevista en agenda.',
  },
  oferta: {
    label: 'Oferta',
    tone: 'success',
    accent: '#10B981',
    background: '#ECFDF5',
    note: 'Recibiste una oferta. Revísala a la brevedad.',
  },
  finalizado: {
    label: 'Finalizado',
    tone: 'neutral',
    accent: '#9CA3AF',
    background: '#F9FAFB',
  },
};

export function MyApplicationsScreen() {
  const { contentWidth } = useResponsiveLayout();
  const summary = CANDIDATE_APPLICATIONS.reduce(
    (acc, app) => {
      acc.total += 1;
      acc[app.status] = (acc[app.status] ?? 0) + 1;
      return acc;
    },
    { total: 0, postulado: 0, revision: 0, entrevista: 0, oferta: 0, finalizado: 0 } as Record<string, number>,
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={[styles.stack, { maxWidth: contentWidth, alignSelf: 'center', width: '100%' }]}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <View style={styles.heroIcon}>
              <Feather name="clipboard" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>Gestión de Postulaciones</Text>
              <Text style={styles.heroSubtitle}>Seguimiento en tiempo real</Text>
            </View>
            <View style={styles.heroPill}>
              <Feather name="check-circle" size={12} color="#0B7A4D" />
              <Text style={styles.heroPillText}>Al día</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Feather name="file-text" size={20} color="#10B981" />
              <Text style={styles.statNumber}>{summary.total}</Text>
              <Text style={styles.statLabel}>Total postulaciones</Text>
            </View>
            <View style={styles.statBox}>
              <Feather name="eye" size={20} color="#F59E0B" />
              <Text style={styles.statNumber}>{summary.revision}</Text>
              <Text style={styles.statLabel}>En revisión</Text>
            </View>
            <View style={styles.statBox}>
              <Feather name="calendar" size={20} color="#3B82F6" />
              <Text style={styles.statNumber}>{summary.entrevista}</Text>
              <Text style={styles.statLabel}>Entrevistas</Text>
            </View>
          </View>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderWrap}>
          <Text style={styles.sectionTitle}>Mis postulaciones</Text>
          <Text style={styles.sectionSubtitle}>Estados, recordatorios y próximos pasos</Text>
        </View>

        {/* Application Cards */}
        {CANDIDATE_APPLICATIONS.map((application) => {
          const tone = statusTone[application.status];
          return (
            <View key={application.id} style={styles.applicationCard}>
              <View style={[styles.cardAccent, { backgroundColor: tone.accent }]} />
              
              <View style={styles.cardContent}>
                {/* Header with Title and Badge */}
                <View style={styles.cardHeader}>
                  <View style={styles.titleWrap}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {application.title}
                    </Text>
                    <Text style={styles.cardCompany} numberOfLines={1}>
                      {application.company}
                    </Text>
                  </View>
                  <StatusBadge label={tone.label} tone={tone.tone} />
                </View>

                {/* Metadata Grid */}
                <View style={styles.metaGrid}>
                  <MetaItem icon="calendar" label={application.submittedAt} prefix="Postulado:" />
                  <MetaItem icon="clipboard" label={application.stage} />
                </View>

                <View style={styles.metaGrid}>
                  <MetaItem icon="flag" label={`Prioridad ${application.priority}`} />
                  <MetaItem icon="file-text" label="CV enviado" />
                </View>

                {/* Status Note */}
                {tone.note && (
                  <View style={[styles.noteBox, { backgroundColor: tone.background }]}>
                    <Feather name="info" size={14} color={tone.accent} />
                    <Text style={[styles.noteText, { color: tone.accent }]}>
                      {tone.note}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function MetaItem({ 
  icon, 
  label, 
  prefix 
}: { 
  icon: keyof typeof Feather.glyphMap; 
  label: string;
  prefix?: string;
}) {
  return (
    <View style={styles.metaItem}>
      <Feather name={icon} size={14} color={colors.textSecondary} />
      <Text style={styles.metaText}>
        {prefix && <Text style={styles.metaPrefix}>{prefix} </Text>}
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    paddingVertical: 16,
    paddingBottom: 120,
  },
  stack: {
    gap: 12,
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
    gap: 16,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  heroPill: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B7A4D',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },

  // Section Header
  sectionHeaderWrap: {
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  // Application Card
  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  cardContent: {
    padding: 16,
    gap: 12,
  },

  // Card Header
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleWrap: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  cardCompany: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Metadata
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: '45%',
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  metaPrefix: {
    fontWeight: '600',
  },

  // Note Box
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
});
