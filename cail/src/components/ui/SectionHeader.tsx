import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  accentColor?: string;
}

export function SectionHeader({ title, subtitle, action, accentColor }: SectionHeaderProps) {
  const pillColor = accentColor ?? colors.accent;

  return (
    <View style={styles.container}>
      <View style={styles.titleWrapper}>
        <View style={[styles.pill, { backgroundColor: pillColor }]} />
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
