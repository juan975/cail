import { useEffect, useState } from 'react';
import { useNotifications } from '../../components/ui/Notifications';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import { EmployerProfileScreen } from './EmployerProfileScreen';
import { OffersManagementScreen } from './OffersManagementScreen';
import ReceivedApplicationsScreen from './ReceivedApplicationsScreen';
import { EmployerUserData } from '../../types';
import logo from '../../assets/logo.png';

const navItems = [
  { id: 'offers', label: 'Ofertas', icon: 'briefcase' },
  { id: 'applications', label: 'Postulaciones', icon: 'users' },
  { id: 'profile', label: 'Empresa', icon: 'building' },
] as const;

type EmployerTab = (typeof navItems)[number]['id'];

interface EmployerShellProps {
  userData: EmployerUserData;
  onLogout: () => void;
}

export function EmployerShell({ userData, onLogout }: EmployerShellProps) {
  const [tab, setTab] = useState<EmployerTab>('offers');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { setTheme } = useNotifications();

  useEffect(() => {
    setTheme('employer');
  }, [setTheme]);

  useEffect(() => {
    document.title = 'CAIL | Panel Empleador';
  }, []);

  const handleTabChange = (newTab: EmployerTab) => {
    setTab(newTab);
    setSearchQuery(''); // Reset search when changing tabs
  };

  const renderScreen = () => {
    switch (tab) {
      case 'profile':
        return <EmployerProfileScreen />;
      case 'applications':
        return <ReceivedApplicationsScreen searchQuery={searchQuery} />;
      default:
        return <OffersManagementScreen searchQuery={searchQuery} />;
    }
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
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
      users: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      building: (
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
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
    return icons[iconName] || icons.briefcase;
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
            padding: '12px 20px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            gap: '12px',
            height: '72px',
            boxSizing: 'border-box',
          }}
        >
          {!sidebarCollapsed ? (
            <>
              <img src={logo} alt="CAIL" style={{ width: '48px', height: '48px' }} />
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#F1842D' }}>CAIL</div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>Empleador</div>
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
                  background: active ? '#FFF7ED' : 'transparent',
                  color: active ? '#F1842D' : '#6B7280',
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
            padding: '12px 24px',
            position: 'sticky',
            top: 0,
            zIndex: 999,
            height: '72px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
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
                placeholder={
                  tab === 'offers'
                    ? 'Buscar por título o descripción de oferta...'
                    : tab === 'applications'
                    ? 'Buscar por nombre de candidato o puesto...'
                    : 'Buscador no habilitado en esta sección'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={tab === 'profile'}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 48px',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  background: tab === 'profile' ? '#F3F4F6' : '#F9FAFB',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  cursor: tab === 'profile' ? 'not-allowed' : 'text',
                }}
                onFocus={(e) => {
                  if (tab !== 'profile') {
                    e.currentTarget.style.borderColor = '#F1842D';
                    e.currentTarget.style.background = '#FFFFFF';
                  }
                }}
                onBlur={(e) => {
                  if (tab !== 'profile') {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                    e.currentTarget.style.background = '#F9FAFB';
                  }
                }}
              />
            </div>

            {/* User Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  padding: '6px 12px',
                  borderRadius: '999px',
                  background: '#FFF7ED',
                  color: '#F59E0B',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                Activo
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937' }}>
                  {userData.company}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>Empleador</div>
              </div>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #F1842D 0%, #EA580C 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '16px',
                }}
              >
                {userData.company.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div>{renderScreen()}</div>
      </div>
    </div>
  );
}
