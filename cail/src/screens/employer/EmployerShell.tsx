import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useResponsiveLayout } from '@/hooks/useResponsive';
import { EmployerProfileScreen } from './EmployerProfileScreen';
import { OffersManagementScreen } from './OffersManagementScreen';
import ReceivedApplicationsScreen from './ReceivedApplicationsScreen';
import { EmployerUserData } from '@/types';
import { useNotifications } from '@/components/ui/Notifications';
import { useEffect } from 'react';

const logo = require('@/assets/logo.png');

type EmployerTab = 'offers' | 'applications' | 'profile';

interface EmployerShellProps {
  userData: EmployerUserData;
  onLogout: () => void;
}

export function EmployerShell({ userData, onLogout }: EmployerShellProps) {
  const [tab, setTab] = useState<EmployerTab>('offers');
  const { contentWidth, horizontalGutter } = useResponsiveLayout();
  const { setTheme } = useNotifications();

  useEffect(() => {
    setTheme('employer');
  }, [setTheme]);

  const renderScreen = () => {
    switch (tab) {
      case 'profile':
        return <EmployerProfileScreen />;
      case 'applications':
        return <ReceivedApplicationsScreen />;
      default:
        return <OffersManagementScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, { paddingHorizontal: horizontalGutter }]}>
        <View style={[styles.maxWidth, styles.flexFill, { maxWidth: contentWidth }]}>
          {/* Header Card (AppBar integrated) */}
          <View style={styles.headerCard}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#F1842D', '#EA580C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>
                    {userData.company.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
              </View>
              <View style={styles.headerCopy}>
                <Text style={styles.headerEyebrow}>Panel Empleador</Text>
                <Text style={styles.headerTitle}>{userData.company}</Text>
                <View style={styles.activeBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.activeBadgeText}>Activo</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
              <Feather name="log-out" color="#EF4444" size={18} />
            </TouchableOpacity>
          </View>

          {/* Contenido Area */}
          <View style={styles.content}>{renderScreen()}</View>
        </View>

        {/* Bottom Navigation Bar */}
        <View style={[styles.navbar, styles.maxWidth, { maxWidth: contentWidth }]}>
          <EmployerNavItem
            icon="briefcase"
            label="Ofertas"
            active={tab === 'offers'}
            onPress={() => setTab('offers')}
          />
          <EmployerNavItem
            icon="users"
            label="Postulaciones"
            active={tab === 'applications'}
            onPress={() => setTab('applications')}
          />
          <EmployerNavItem 
            icon="building" 
            label="Empresa" 
            active={tab === 'profile'} 
            onPress={() => setTab('profile')} 
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function EmployerNavItem({
  icon,
  label,
  active,
  onPress,
}: {
  icon: string;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[styles.navItem, active && styles.navItemActive]}
      activeOpacity={0.7}
    >
      <View style={[styles.navIcon, active && styles.navIconActive]}>
        <FontAwesome5 
          name={icon} 
          size={20} 
          color={active ? '#F59E0B' : '#6B7280'} 
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    flex: 1,
    paddingTop: 12,
    backgroundColor: 'transparent',
  },
  maxWidth: {
    width: '100%',
    alignSelf: 'center',
  },
  flexFill: {
    flex: 1,
  },
  // Header Card
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  // Bottom Navigation
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    width: '90%', // Narrower than contentWidth
    alignSelf: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderRadius: 16,
  },
  navItemActive: {
    backgroundColor: '#FFF7ED',
  },
  navIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFB',
  },
  navIconActive: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  navLabelActive: {
    color: '#F59E0B',
    fontWeight: '700',
  },
});
