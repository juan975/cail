import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
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
          <View style={styles.headerCard}>
            <View style={styles.headerLeft}>
              {/* Logo Badge */}
              <View style={styles.logoBadge}>
                <Image source={logo} style={styles.logo} />
              </View>
              
              {/* Header Text */}
              <View style={styles.headerCopy}>
                <Text style={styles.headerEyebrow}>Módulo candidato</Text>
                <Text style={styles.headerTitle}>Bolsa de Empleo CAIL</Text>
                <Text style={styles.headerSubtitle}>Hola, {userData.name}</Text>
              </View>
            </View>

            {/* Header Actions */}
            <View style={styles.headerActions}>
              {/* Status Badge */}
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Activo</Text>
              </View>

              {/* Logout Button */}
              <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
                <Feather name="log-out" color="#EF4444" size={18} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content Area */}
          <View style={styles.content}>{renderScreen()}</View>
        </View>

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
  icon: keyof typeof Feather.glyphMap;
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
          <Feather 
            name={icon} 
            size={20} 
            color={active ? '#0B7A4D' : colors.textSecondary} 
          />
        </View>
        {badge && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>
        {label}
      </Text>
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
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F8FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Header Actions
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B7A4D',
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
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginTop: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 16,
    gap: 4,
  },
  navItemActive: {
    backgroundColor: '#F0FDF4',
  },
  navIconContainer: {
    position: 'relative',
  },
  navIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFB',
  },
  navIconActive: {
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: '#BBF7D0',
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
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  navLabelActive: {
    color: '#0B7A4D',
    fontWeight: '700',
  },
});
