import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { InputField } from '@/components/ui/InputField';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import { useResponsiveLayout } from '@/hooks/useResponsive';
import { EmployerProfileForm } from '@/types';
import { initialEmployerProfile } from '@/data/mockData';
import { colors } from '@/theme/colors';

export function EmployerProfileScreen() {
  const { isDesktop, contentWidth, horizontalGutter } = useResponsiveLayout();
  const [form, setForm] = useState<EmployerProfileForm>(initialEmployerProfile);

  const updateField = (key: keyof EmployerProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingHorizontal: horizontalGutter }]}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.surfaceCard,
          styles.heroCard,
          styles.heroShadow,
          { maxWidth: contentWidth, alignSelf: 'center' },
        ]}
      >
        <View style={styles.heroHeader}>
          <View style={styles.iconBadge}>
            <Feather name="home" size={18} color={colors.employerDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Identidad empresarial al día</Text>
            <Text style={styles.heroSubtitle}>Mantén tus datos consistentes para generar confianza en las postulaciones.</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Feather name="briefcase" size={14} color={colors.employerDark} />
            <Text style={styles.metaText}>{form.industry || 'Industria por definir'}</Text>
          </View>
          <View style={styles.metaPill}>
            <Feather name="users" size={14} color={colors.employerDark} />
            <Text style={styles.metaText}>{form.numberOfEmployees || 'Colaboradores'}</Text>
          </View>
          <View style={styles.metaPill}>
            <Feather name="map-pin" size={14} color={colors.employerDark} />
            <Text style={styles.metaText}>{form.address || 'Ubicación'}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.surfaceCard, { maxWidth: contentWidth, alignSelf: 'center' }]}>
        <SectionHeader
          title="Perfil empresarial"
          subtitle="Esta información será visible para los candidatos"
          accentColor={colors.employer}
        />

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Identidad</Text>
          <View style={[styles.formGrid, isDesktop && styles.formGridDesktop]}>
            <View style={[styles.formItem, isDesktop && styles.formItemHalf]}>
              <InputField
                tone="employer"
                label="Razón social"
                value={form.companyName}
                onChangeText={(text) => updateField('companyName', text)}
              />
            </View>
            <View style={[styles.formItem, isDesktop && styles.formItemHalf]}>
              <InputField
                tone="employer"
                label="Industria"
                value={form.industry}
                onChangeText={(text) => updateField('industry', text)}
              />
            </View>
            <View style={[styles.formItem, isDesktop && styles.formItemHalf]}>
              <InputField
                tone="employer"
                label="Número de colaboradores"
                value={form.numberOfEmployees}
                onChangeText={(text) => updateField('numberOfEmployees', text)}
              />
            </View>
            <View style={[styles.formItem, isDesktop && styles.formItemHalf]}>
              <InputField
                tone="employer"
                label="Dirección"
                value={form.address}
                onChangeText={(text) => updateField('address', text)}
              />
            </View>
          </View>
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Contacto principal</Text>
          <View style={[styles.formGrid, isDesktop && styles.formGridDesktop]}>
            <View style={[styles.formItem, isDesktop && styles.formItemHalf]}>
              <InputField
                tone="employer"
                label="Persona de contacto"
                value={form.contactName}
                onChangeText={(text) => updateField('contactName', text)}
              />
            </View>
            <View style={[styles.formItem, isDesktop && styles.formItemHalf]}>
              <InputField
                tone="employer"
                label="Teléfono"
                value={form.phone}
                onChangeText={(text) => updateField('phone', text)}
              />
            </View>
            <View style={[styles.formItem, isDesktop && styles.formItemHalf]}>
              <InputField
                tone="employer"
                label="Correo"
                value={form.email}
                onChangeText={(text) => updateField('email', text)}
                autoCapitalize="none"
              />
            </View>
            <View style={[styles.formItem, isDesktop && styles.formItemHalf]}>
              <InputField
                tone="employer"
                label="Sitio web"
                value={form.website}
                onChangeText={(text) => updateField('website', text)}
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Descripción</Text>
          <View style={styles.formGrid}>
            <View style={styles.formItem}>
              <InputField
                tone="employer"
                label="Resumen de la empresa"
                value={form.description}
                onChangeText={(text) => updateField('description', text)}
                multiline
              />
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Button label="Guardar perfil" onPress={() => Alert.alert('Perfil actualizado')} fullWidth tone="employer" />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    paddingBottom: 140,
  },
  surfaceCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    padding: 18,
    marginBottom: 14,
  },
  heroCard: {
    gap: 12,
  },
  heroShadow: {
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  heroHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.employerSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  heroSubtitle: {
    color: '#6B7280',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  metaText: {
    color: '#1F2937',
    fontWeight: '600',
  },
  sectionBlock: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  formGrid: {
    gap: 4,
  },
  formGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  formItem: {
    flex: 1,
  },
  formItemHalf: {
    minWidth: '48%',
    flexBasis: '48%',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  actionRow: {
    marginTop: 4,
  },
});
