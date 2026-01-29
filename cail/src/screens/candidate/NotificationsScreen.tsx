import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { useResponsiveLayout } from '@/hooks/useResponsive';

const NOTIFICATION_ITEMS = [
  {
    id: '1',
    title: 'Tu perfil ha sido verificado',
    description: 'Ahora puedes postular a vacantes con mayor visibilidad para los reclutadores.',
    date: 'Hace 2 horas',
    unread: true,
    category: 'Sistema',
  },
  {
    id: '2',
    title: 'Nueva vacante en tu área',
    description: 'Se ha publicado una vacante para Desarrollador React Native que coincide con tu perfil.',
    date: 'Hace 5 horas',
    unread: true,
    category: 'Sugerencia',
  },
  {
    id: '3',
    title: 'Postulación vista',
    description: 'Un reclutador ha revisado tu postulación para Arquitecto de Software.',
    date: 'Ayer',
    unread: false,
    category: 'Proceso',
  },
];

const NOTIFICATION_PREFERENCES = [
  { id: '1', label: 'Notificaciones push', description: 'Recibe alertas en tu dispositivo móvil', enabled: true },
  { id: '2', label: 'Correos electrónicos', description: 'Resumen semanal y alertas importantes', enabled: true },
  { id: '3', label: 'Mensajes SMS', description: 'Solo para alertas urgentes de seguridad', enabled: false },
  { id: '4', label: 'Alertas de empleo', description: 'Cuando aparezcan vacantes compatibles', enabled: true },
];

export function NotificationsScreen() {
  const { contentWidth } = useResponsiveLayout();
  const [preferences, setPreferences] = useState(NOTIFICATION_PREFERENCES);
  const [tab, setTab] = useState<'feed' | 'settings'>('feed');

  const togglePreference = (id: string) => {
    setPreferences((prev) => prev.map((pref) => (pref.id === id ? { ...pref, enabled: !pref.enabled } : pref)));
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={[styles.stack, { maxWidth: contentWidth, alignSelf: 'center', width: '100%' }]}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <View style={styles.heroIcon}>
              <Feather name="bell" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>Centro de alertas</Text>
              <Text style={styles.heroSubtitle}>Notificaciones y comunicación</Text>
            </View>
          </View>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <TabButton
            label="Notificaciones"
            icon="bell"
            active={tab === 'feed'}
            onPress={() => setTab('feed')}
          />
          <TabButton
            label="Configuración"
            icon="settings"
            active={tab === 'settings'}
            onPress={() => setTab('settings')}
          />
        </View>

        {tab === 'feed' ? (
          <View style={styles.feedSection}>
            {/* Section Header */}
            <View style={styles.sectionHeaderWrap}>
              <Text style={styles.sectionTitle}>Resumen</Text>
              <Text style={styles.sectionSubtitle}>Últimas actualizaciones</Text>
            </View>

            {/* Notification Items */}
            {NOTIFICATION_ITEMS.map((item, index) => (
              <View key={item.id} style={styles.notificationCard}>
                <View style={styles.notificationContent}>
                  {/* Icon Badge */}
                  <View style={[
                    styles.iconBadge,
                    { backgroundColor: getCategoryColor(item.category) + '20' }
                  ]}>
                    <Feather
                      name={getCategoryIcon(item.category)}
                      size={20}
                      color={getCategoryColor(item.category)}
                    />
                  </View>

                  {/* Content */}
                  <View style={styles.notificationBody}>
                    <View style={styles.notificationHeader}>
                      <Text style={styles.notificationTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                      {item.category && (
                        <View style={[
                          styles.categoryBadge,
                          { backgroundColor: getCategoryColor(item.category) + '15' }
                        ]}>
                          <Text style={[
                            styles.categoryText,
                            { color: getCategoryColor(item.category) }
                          ]}>
                            {item.category}
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.notificationDescription} numberOfLines={2}>
                      {item.description}
                    </Text>

                    <View style={styles.notificationMeta}>
                      <Feather name="clock" size={12} color={colors.textSecondary} />
                      <Text style={styles.notificationDate}>{item.date}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.settingsSection}>
            {/* Section Header */}
            <View style={styles.sectionHeaderWrap}>
              <Text style={styles.sectionTitle}>Preferencias</Text>
              <Text style={styles.sectionSubtitle}>Activa los canales que prefieras</Text>
            </View>

            {/* Preferences Card */}
            <View style={styles.preferencesCard}>
              {preferences.map((pref, index) => (
                <View
                  key={pref.id}
                  style={[
                    styles.preferenceRow,
                    index < preferences.length - 1 && styles.preferenceRowBorder
                  ]}
                >
                  <View style={styles.preferenceIcon}>
                    <Feather
                      name={getPreferenceIcon(pref.label)}
                      size={20}
                      color={pref.enabled ? '#0B7A4D' : colors.textSecondary}
                    />
                  </View>

                  <View style={styles.preferenceContent}>
                    <Text style={styles.preferenceLabel}>{pref.label}</Text>
                    <Text style={styles.preferenceDescription}>{pref.description}</Text>
                  </View>

                  <Switch
                    trackColor={{ false: '#E5E7EB', true: '#86EFAC' }}
                    thumbColor={pref.enabled ? '#0B7A4D' : '#FFFFFF'}
                    ios_backgroundColor="#E5E7EB"
                    value={pref.enabled}
                    onValueChange={() => togglePreference(pref.id)}
                  />
                </View>
              ))}
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Feather name="info" size={16} color="#3B82F6" />
              <Text style={styles.infoText}>
                Puedes cambiar estas preferencias en cualquier momento.
                Las notificaciones importantes siempre te llegarán.
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function TabButton({
  label,
  icon,
  active,
  onPress
}: {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabButton, active && styles.tabButtonActive]}
    >
      <Feather
        name={icon}
        size={16}
        color={active ? '#0B7A4D' : colors.textSecondary}
      />
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function getCategoryColor(category?: string) {
  switch (category) {
    case 'Proceso':
      return '#3B82F6'; // Blue
    case 'Sugerencia':
      return '#10B981'; // Green
    case 'Alerta':
      return '#EF4444'; // Red
    case 'Sistema':
      return '#8B5CF6'; // Purple
    default:
      return '#6B7280'; // Gray
  }
}

function getCategoryIcon(category?: string): keyof typeof Feather.glyphMap {
  switch (category) {
    case 'Proceso':
      return 'activity';
    case 'Sugerencia':
      return 'zap';
    case 'Alerta':
      return 'alert-circle';
    case 'Sistema':
      return 'settings';
    default:
      return 'bell';
  }
}

function getPreferenceIcon(label: string): keyof typeof Feather.glyphMap {
  if (label.toLowerCase().includes('correo') || label.toLowerCase().includes('email')) {
    return 'mail';
  }
  if (label.toLowerCase().includes('push') || label.toLowerCase().includes('móvil')) {
    return 'smartphone';
  }
  if (label.toLowerCase().includes('sms')) {
    return 'message-square';
  }
  if (label.toLowerCase().includes('whatsapp')) {
    return 'message-circle';
  }
  return 'bell';
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    paddingVertical: 16,
    paddingBottom: 120,
  },
  stack: {
    gap: 12,
    width: '100%',
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
  heroBadge: {
    backgroundColor: '#EF4444',
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  heroBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Tab Bar
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 6,
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#F0FDF4',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabButtonTextActive: {
    color: '#0B7A4D',
  },

  // Section Headers
  feedSection: {
    gap: 12,
  },
  settingsSection: {
    gap: 12,
  },
  sectionHeaderWrap: {
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

  // Notification Card
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationContent: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBody: {
    flex: 1,
    gap: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
  },
  notificationDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notificationDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Preferences Card
  preferencesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  preferenceRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  preferenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F8FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },

  // Info Box
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
  },
});
