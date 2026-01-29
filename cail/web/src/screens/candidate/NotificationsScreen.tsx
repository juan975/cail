import { useState } from 'react';
import { FiBell, FiClock, FiInfo, FiSettings, FiCheckCircle, FiSearch, FiAlertCircle, FiBriefcase, FiUser } from 'react-icons/fi';
import { colors } from '../../theme/colors';
import { useResponsiveLayout } from '../../hooks/useResponsive';

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

interface NotificationsScreenProps {
  searchQuery?: string;
}

export function NotificationsScreen({ searchQuery = '' }: NotificationsScreenProps) {
  const { contentWidth } = useResponsiveLayout();
  const [preferences, setPreferences] = useState(NOTIFICATION_PREFERENCES);
  const [tab, setTab] = useState<'feed' | 'settings'>('feed');

  const togglePreference = (id: string) => {
    setPreferences((prev: any[]) => prev.map((pref) => (pref.id === id ? { ...pref, enabled: !pref.enabled } : pref)));
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'Proceso': return <FiBriefcase size={20} />;
      case 'Sugerencia': return <FiSearch size={20} />;
      case 'Sistema': return <FiUser size={20} />;
      case 'Alerta': return <FiAlertCircle size={20} />;
      default: return <FiBell size={20} />;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'Proceso': return '#10B981'; // Green
      case 'Sugerencia': return '#3B82F6'; // Blue
      case 'Alerta': return '#EF4444'; // Red
      case 'Sistema': return '#8B5CF6'; // Purple
      default: return '#6B7280';
    }
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #0B7A4D 0%, #065F46 100%)',
          borderRadius: 20,
          padding: '24px',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          boxShadow: '0 8px 16px rgba(11, 122, 77, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.1, color: '#fff' }}>
          <FiBell size={100} />
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center', zIndex: 1 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <FiBell size={26} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em' }}>Centro de alertas</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>Mantente actualizado sobre tus postulaciones y perfil</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, background: '#F3F4F6', padding: 6, borderRadius: 12 }}>
        <button
          type="button"
          onClick={() => setTab('feed')}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: 10,
            border: 'none',
            background: tab === 'feed' ? '#FFFFFF' : 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: 14,
            fontWeight: tab === 'feed' ? 700 : 500,
            color: tab === 'feed' ? '#0B7A4D' : '#64748B',
            transition: 'all 0.2s',
            boxShadow: tab === 'feed' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          <FiBell size={18} /> Notificaciones
        </button>
        <button
          type="button"
          onClick={() => setTab('settings')}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: 10,
            border: 'none',
            background: tab === 'settings' ? '#FFFFFF' : 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: 14,
            fontWeight: tab === 'settings' ? 700 : 500,
            color: tab === 'settings' ? '#0B7A4D' : '#64748B',
            transition: 'all 0.2s',
            boxShadow: tab === 'settings' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          <FiSettings size={18} /> Configuración
        </button>
      </div>

      {tab === 'feed' ? (
        <div style={{ display: 'grid', gap: 12 }}>
          {NOTIFICATION_ITEMS.map((item) => (
            <div
              key={item.id}
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: '20px',
                border: '1px solid #E5E7EB',
                transition: 'all 0.2s',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                gap: 16,
                boxShadow: item.unread ? '0 4px 12px rgba(59, 130, 246, 0.05)' : 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)';
                e.currentTarget.style.borderColor = '#0B7A4D40';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = item.unread ? '0 4px 12px rgba(59, 130, 246, 0.05)' : 'none';
                e.currentTarget.style.borderColor = '#E5E7EB';
              }}
            >
              {item.unread && (
                <div style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#3B82F6',
                  boxShadow: '0 0 0 2px #fff, 0 0 8px #3B82F680'
                }} />
              )}

              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: `${getCategoryColor(item.category)}12`,
                  display: 'grid',
                  placeItems: 'center',
                  color: getCategoryColor(item.category),
                  flexShrink: 0
                }}
              >
                {getCategoryIcon(item.category)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1F2937' }}>{item.title}</div>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: `${getCategoryColor(item.category)}15`,
                      color: getCategoryColor(item.category),
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em'
                    }}
                  >
                    {item.category}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, marginTop: 4 }}>{item.description}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 12, color: '#94A3B8' }}>
                  <FiClock size={12} /> {item.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            {preferences.map((pref: any, index: number) => (
              <div
                key={pref.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '18px 24px',
                  borderBottom: index < preferences.length - 1 ? '1px solid #F3F4F6' : 'none',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#111827', fontSize: 15 }}>{pref.label}</div>
                  <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{pref.description}</div>
                </div>
                
                {/* Custom Toggle Switch */}
                <div 
                  onClick={() => togglePreference(pref.id)}
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    background: pref.enabled ? '#0B7A4D' : '#E5E7EB',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: pref.enabled ? '0 2px 8px rgba(11, 122, 77, 0.2)' : 'none'
                  }}
                >
                  <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute',
                    top: 3,
                    left: pref.enabled ? 23 : 3,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, background: '#F0F9FF', borderRadius: 16, padding: '16px 20px', border: '1px solid #BAE6FD' }}>
            <FiInfo size={20} color="#0284C7" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: 13, color: '#0369A1', lineHeight: 1.5 }}>
              Administra cómo deseas recibir alertas importantes. Mantener las notificaciones activas te ayudará a no perder ninguna oportunidad.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
