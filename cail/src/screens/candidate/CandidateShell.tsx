import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/theme/colors';
import { useResponsiveLayout } from '@/hooks/useResponsive';
import { CandidateProfileScreen } from './CandidateProfileScreen';
import { JobDiscoveryScreen } from './JobDiscoveryScreen';
import { MyApplicationsScreen } from './MyApplicationsScreen';
import { NotificationsScreen } from './NotificationsScreen';
import { CandidateUserData } from '@/types';

const logo = require('@/assets/logo.png');

type CandidateTab = 'discovery' | 'applications' | 'notifications' | 'profile';

interface CandidateShellProps {
  userData: CandidateUserData;
  onLogout: () => void;
}

export function CandidateShell({ userData, onLogout }: CandidateShellProps) {
  const [tab, setTab] = useState<CandidateTab>('discovery');
  const { contentWidth, horizontalGutter } = useResponsiveLayout();

  const renderScreen = () => {
    switch (tab) {
      case 'profile':
        return <CandidateProfileScreen />;
      case 'applications':
        return <MyApplicationsScreen />;
      case 'notifications':
        return <NotificationsScreen />;
      default:
        return <JobDiscoveryScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, { paddingHorizontal: horizontalGutter }]}>
        <View style={[styles.maxWidth, styles.flexFill, { maxWidth: contentWidth }]}>
          {/* Header Card */}
          {/* Header Card (AppBar integrated) */}
          <View style={styles.headerCard}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#34D399', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>
                    {userData.name.charAt(0).toUpperCase() || 'C'}
                  </Text>
                </LinearGradient>
              </View>
              <View style={styles.headerCopy}>
                <Text style={styles.headerEyebrow}>Portal Candidato</Text>
                <Text style={styles.headerTitle}>{userData.name}</Text>
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

          {/* Content Area */}
          <View style={styles.content}>{renderScreen()}</View>
        </View>

        {/* Bottom Navigation Bar */}
        {/* Bottom Navigation Bar */}
        <View style={[styles.navbar, styles.maxWidth, { maxWidth: contentWidth }]}>
          <NavItem 
            icon="compass" 
            label="Descubrir" 
            active={tab === 'discovery'} 
            onPress={() => setTab('discovery')} 
          />
          <NavItem
            icon="briefcase"
            label="Postulaciones"
            active={tab === 'applications'}
            onPress={() => setTab('applications')}
          />
          <NavItem
            icon="bell"
            label="Alertas"
            badge={2} 
            active={tab === 'notifications'}
            onPress={() => setTab('notifications')}
          />
          <NavItem 
            icon="user" 
            label="Perfil" 
            active={tab === 'profile'} 
            onPress={() => setTab('profile')} 
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function NavItem({
  icon,
  label,
  badge,
  active,
  onPress,
}: {
  icon: string;
  label: string;
  badge?: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[styles.navItem, active && styles.navItemActive]}
      activeOpacity={0.7}
    >
      <View style={styles.navIconContainer}>
        <View style={[styles.navIcon, active && styles.navIconActive]}>
          <FontAwesome5 
            name={icon} 
            size={20} 
            color={active ? '#059669' : '#6B7280'} 
          />
        </View>
        {badge && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
          </View>
        )}
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
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
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

  // Content
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
    backgroundColor: '#ECFDF5',
  },
  navIconContainer: {
    position: 'relative',
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
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#6EE7B7',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
