import { colors } from '../../theme/colors';
import { useNotifications } from '../../components/ui/Notifications';
import { useEffect, useState } from 'react';
import { CandidateProfileScreen } from './CandidateProfileScreen';
import { JobDiscoveryScreen } from './JobDiscoveryScreen';
import { MyApplicationsScreen } from './MyApplicationsScreen';
import { NotificationsScreen } from './NotificationsScreen';
import { CandidateUserData } from '../../types';
import logo from '../../assets/logo.png';

const navItems = [
  { id: 'discovery', label: 'Descubrir', icon: 'compass' },
  { id: 'applications', label: 'Postulaciones', icon: 'briefcase' },
  { id: 'notifications', label: 'Alertas', icon: 'bell' },
  { id: 'profile', label: 'Perfil', icon: 'user' },
] as const;

type CandidateTab = (typeof navItems)[number]['id'];

interface CandidateShellProps {
  userData: CandidateUserData;
  onLogout: () => void;
}

export function CandidateShell({ userData, onLogout }: CandidateShellProps) {
  const [tab, setTab] = useState<CandidateTab>('discovery');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { setTheme } = useNotifications();

  useEffect(() => {
    setTheme('candidate');
  }, [setTheme]);

  useEffect(() => {
    document.title = 'CAIL | Portal Candidato';
  }, []);

  const handleTabChange = (newTab: CandidateTab) => {
    setTab(newTab);
    setSearchQuery(''); // Clear search when switching tabs
  };

  const renderScreen = () => {
    switch (tab) {
      case 'profile':
        return <CandidateProfileScreen />;
      case 'applications':
        return <MyApplicationsScreen searchQuery={searchQuery} />;
      case 'notifications':
        return <NotificationsScreen searchQuery={searchQuery} />;
      default:
        return <JobDiscoveryScreen searchQuery={searchQuery} />;
    }
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
      compass: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      briefcase: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      bell: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
      user: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      logout: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      ),
      search: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
    };
    return icons[iconName] || icons.compass;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FFFFFF' }}>
      {/* Sidebar */}
      <div
        style={{
          width: sidebarCollapsed ? '80px' : '260px',
          background: '#FFFFFF',
          borderRight: '1px solid #E5E7EB',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s',
          zIndex: 1000,
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: '80px',
            padding: '0 20px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            gap: '12px',
          }}
        >
          {!sidebarCollapsed ? (
            <>
              <img src={logo} alt="CAIL" style={{ width: '48px', height: '48px' }} />
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#1A936F' }}>CAIL</div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>Candidato</div>
              </div>
            </>
          ) : (
            <img src={logo} alt="CAIL" style={{ width: '32px', height: '32px' }} />
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabChange(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: active ? '#E1F4EB' : 'transparent',
                  color: active ? '#0B7A4D' : '#6B7280',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: active ? 600 : 500,
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = '#F3F4F6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {getIcon(item.icon)}
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid #E5E7EB' }}>
          <button
            type="button"
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              background: 'transparent',
              color: '#EF4444',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              width: '100%',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FEE2E2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {getIcon('logout')}
            {!sidebarCollapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          marginLeft: sidebarCollapsed ? '80px' : '260px',
          flex: 1,
          transition: 'margin-left 0.2s',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
            height: '80px',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 999,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              width: '100%',
            }}
          >
            {/* Search Bar */}
            <div style={{ flex: 1, position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9CA3AF',
                }}
              >
                {getIcon('search')}
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  tab === 'discovery' ? "Buscar por título o ciudad..." : 
                  tab === 'applications' ? "Filtrar por puesto..." :
                  tab === 'notifications' ? "Buscar en alertas y notificaciones..." :
                  "Buscador no disponible en perfil"
                }
                disabled={tab === 'profile'}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 48px',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  background: tab === 'profile' ? '#F3F4FB' : '#F9FAFB',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  opacity: tab === 'profile' ? 0.6 : 1,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#1A936F';
                  e.currentTarget.style.background = '#FFFFFF';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.background = '#F9FAFB';
                }}
              />
            </div>

            {/* User Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  padding: '6px 12px',
                  borderRadius: '999px',
                  background: '#ECFDF5',
                  color: '#059669',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                Activo
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937' }}>
                  {userData.name}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>Candidato</div>
              </div>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #1A936F 0%, #0B6E4F 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '16px',
                }}
              >
                {userData.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>{renderScreen()}</div>
      </div>
    </div>
  );
}
