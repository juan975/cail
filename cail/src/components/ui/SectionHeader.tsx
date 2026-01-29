import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/theme/colors';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  accentColor?: string;
  icon?: keyof typeof Feather.glyphMap;
}

export function SectionHeader({ title, subtitle, action, accentColor, icon }: SectionHeaderProps) {
  const pillColor = accentColor ?? colors.accent;

  return (
    <View style={styles.container}>
      <View style={styles.titleWrapper}>
        {icon ? (
          <View style={[styles.iconBox, { backgroundColor: pillColor + '20' }]}>
            <Feather name={icon} size={18} color={pillColor} />
          </View>
        ) : (
          <View style={[styles.pill, { backgroundColor: pillColor }]} />
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 12,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  pill: {
    width: 8,
    height: 32,
    borderRadius: 999,
    backgroundColor: colors.accent,
    marginTop: 2,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  action: {
    alignSelf: 'center',
  },
});
