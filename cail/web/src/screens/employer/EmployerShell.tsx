import { useState } from 'react';
import { FiBriefcase, FiHome, FiLogOut, FiUsers } from 'react-icons/fi';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import { EmployerProfileScreen } from './EmployerProfileScreen';
import { OffersManagementScreen } from './OffersManagementScreen';
import ReceivedApplicationsScreen from './ReceivedApplicationsScreen';
import { EmployerUserData } from '../../types';
import logo from '../../assets/logo.png';

const navItems = [
  { id: 'offers', label: 'Ofertas', icon: FiBriefcase },
  { id: 'applications', label: 'Postulaciones', icon: FiUsers },
  { id: 'profile', label: 'Empresa', icon: FiHome },
] as const;

type EmployerTab = typeof navItems[number]['id'];

interface EmployerShellProps {
  userData: EmployerUserData;
  onLogout: () => void;
}

export function EmployerShell({ userData, onLogout }: EmployerShellProps) {
  const [tab, setTab] = useState<EmployerTab>('offers');
  const { contentWidth, horizontalGutter } = useResponsiveLayout();

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
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB' }}>
        <div
          style={{
            maxWidth: contentWidth,
            margin: '0 auto',
            padding: `14px ${horizontalGutter}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={logo} alt="CAIL" style={{ width: 40, height: 40, borderRadius: 8 }} />
            <div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>Empleador</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{userData.company}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              border: '1px solid #E5E7EB',
              background: '#fff',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
          >
            <FiLogOut size={18} color="#374151" />
          </button>
        </div>
      </div>

      <div style={{ padding: `16px ${horizontalGutter}px 90px` }}>
        <div style={{ maxWidth: contentWidth, margin: '0 auto' }}>{renderScreen()}</div>
      </div>

      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: '#fff', borderTop: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: contentWidth, margin: '0 auto', padding: `10px ${horizontalGutter}px` }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  style={{
                    border: 'none',
                    borderRadius: 12,
                    padding: '10px 12px',
                    background: active ? '#FFF7ED' : 'transparent',
                    color: active ? '#F59E0B' : '#9CA3AF',
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <Icon size={18} /> {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
