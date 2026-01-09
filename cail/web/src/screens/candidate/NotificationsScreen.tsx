import { useState } from 'react';
import { FiBell, FiClock, FiInfo, FiSettings } from 'react-icons/fi';
import { colors } from '../../theme/colors';
import { NOTIFICATION_ITEMS, NOTIFICATION_PREFERENCES } from '../../data/mockData';
import { useResponsiveLayout } from '../../hooks/useResponsive';

export function NotificationsScreen() {
  const { contentWidth } = useResponsiveLayout();
  const [preferences, setPreferences] = useState(NOTIFICATION_PREFERENCES);
  const [tab, setTab] = useState<'feed' | 'settings'>('feed');

  const togglePreference = (id: string) => {
    setPreferences((prev) => prev.map((pref) => (pref.id === id ? { ...pref, enabled: !pref.enabled } : pref)));
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'Proceso':
        return '#F59E0B';
      case 'Sugerencia':
        return '#3B82F6';
      case 'Alerta':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div
        style={{
          background: '#0B7A4D',
          borderRadius: 16,
          padding: 20,
          color: '#fff',
          display: 'flex',
          gap: 16,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.2)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <FiBell size={22} />
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Centro de alertas</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>Notificaciones y comunicación</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, background: '#F3F4F6', padding: 6, borderRadius: 12 }}>
        <button
          type="button"
          onClick={() => setTab('feed')}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 10,
            border: 'none',
            background: tab === 'feed' ? '#FFFFFF' : 'transparent',
            cursor: 'pointer',
          }}
        >
          <FiBell /> Notificaciones
        </button>
        <button
          type="button"
          onClick={() => setTab('settings')}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 10,
            border: 'none',
            background: tab === 'settings' ? '#FFFFFF' : 'transparent',
            cursor: 'pointer',
          }}
        >
          <FiSettings /> Configuración
        </button>
      </div>

      {tab === 'feed' ? (
        <div style={{ display: 'grid', gap: 12 }}>
          {NOTIFICATION_ITEMS.map((item) => (
            <div
              key={item.id}
              style={{
                background: '#fff',
                borderRadius: 14,
                padding: 14,
                border: '1px solid #E5E7EB',
              }}
            >
              <div style={{ display: 'flex', gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `${getCategoryColor(item.category)}20`,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <FiBell size={20} color={getCategoryColor(item.category)} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ fontWeight: 700 }}>{item.title}</div>
                    {item.category && (
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: 999,
                          background: `${getCategoryColor(item.category)}15`,
                          color: getCategoryColor(item.category),
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>{item.description}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: colors.textSecondary }}>
                    <FiClock size={12} /> {item.date}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB' }}>
            {preferences.map((pref, index) => (
              <div
                key={pref.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 14,
                  borderBottom: index < preferences.length - 1 ? '1px solid #F3F4F6' : 'none',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{pref.label}</div>
                  <div style={{ fontSize: 12, color: colors.textSecondary }}>{pref.description}</div>
                </div>
                <input
                  type="checkbox"
                  checked={pref.enabled}
                  onChange={() => togglePreference(pref.id)}
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, background: '#EFF6FF', borderRadius: 12, padding: 12 }}>
            <FiInfo size={18} color="#3B82F6" />
            <div style={{ fontSize: 12, color: '#1E40AF' }}>
              Puedes cambiar estas preferencias en cualquier momento. Las notificaciones importantes siempre te llegarán.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
