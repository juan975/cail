import { colors } from '../../theme/colors';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: colors.textPrimary }}>{title}</div>
      {subtitle && (
        <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>{subtitle}</div>
      )}
    </div>
  );
}
