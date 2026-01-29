import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  Animated, 
  TouchableOpacity, 
  Dimensions,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';

type NotificationVariant = 'success' | 'info' | 'warning' | 'danger';

type AlertOptions = {
  title: string;
  message: string;
  variant?: NotificationVariant;
  primaryLabel?: string;
  secondaryLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

interface NotificationsApi {
  alert: (options: AlertOptions | string, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  setTheme: (theme: 'candidate' | 'employer' | 'default') => void;
}

const NotificationsContext = createContext<NotificationsApi | null>(null);

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertOptions | null>(null);
  const [theme, setThemeState] = useState<'candidate' | 'employer' | 'default'>('default');
  
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const show = useCallback((options: AlertOptions | string, title?: string) => {
    let finalOptions: AlertOptions;
    if (typeof options === 'string') {
      finalOptions = {
        title: title || 'Atención',
        message: options,
        variant: 'info'
      };
    } else {
      finalOptions = options;
    }

    setConfig(finalOptions);
    setVisible(true);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setConfig(null);
    });
  }, []);

  const api: NotificationsApi = {
    alert: show,
    success: (message, title) => show({ title: title || 'Perfecto', message, variant: 'success' }),
    error: (message, title) => show({ title: title || 'Error', message, variant: 'danger' }),
    setTheme: (t) => setThemeState(t),
  };

  const currentVariant = config?.variant || 'info';
  
  const getVariantStyles = () => {
    // Determine colors based on variant and theme
    if (currentVariant === 'success') {
      if (theme === 'employer') {
        return { icon: 'check-circle', color: '#EA580C', bg: '#FFF7ED' };
      }
      return { icon: 'check-circle', color: '#10B981', bg: '#ECFDF5' };
    }

    if (currentVariant === 'info') {
      if (theme === 'employer') {
        return { icon: 'info', color: '#EA580C', bg: '#FFF7ED' };
      }
      return { icon: 'info', color: '#3B82F6', bg: '#EFF6FF' };
    }

    switch (currentVariant) {
      case 'danger': return { icon: 'x-circle', color: '#EF4444', bg: '#FEF2F2' };
      case 'warning': return { icon: 'alert-triangle', color: '#F59E0B', bg: '#FFFBEB' };
      default: return { icon: 'info', color: '#3B82F6', bg: '#EFF6FF' };
    }
  };

  const styles_v = getVariantStyles();

  return (
    <NotificationsContext.Provider value={api}>
      {children}
      
      <Modal transparent visible={visible} animationType="none">
        <View style={styles.overlay}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15, 23, 42, 0.6)' }]} />
          
          <Animated.View style={[
            styles.alertContainer,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}>
            <View style={[styles.iconContainer, { backgroundColor: styles_v.bg }]}>
              <Feather name={styles_v.icon as any} size={32} color={styles_v.color} />
            </View>

            <Text style={styles.title}>{config?.title}</Text>
            <Text style={styles.message}>{config?.message}</Text>

            <View style={styles.buttonContainer}>
              {config?.secondaryLabel && (
                <TouchableOpacity 
                  style={styles.secondaryButton} 
                  onPress={() => {
                    config.onCancel?.();
                    hide();
                  }}
                >
                  <Text style={styles.secondaryButtonText}>{config.secondaryLabel}</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.primaryButton, { backgroundColor: styles_v.color }]} 
                onPress={() => {
                  config?.onConfirm?.();
                  hide();
                }}
              >
                <Text style={styles.primaryButtonText}>{config?.primaryLabel || 'Entendido'}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 10,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryButtonText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '700',
  },
});
