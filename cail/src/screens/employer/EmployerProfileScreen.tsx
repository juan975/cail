import { useState, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MotiView } from '@/components/MotiView';
import { useNotifications } from '@/components/ui/Notifications';
import { InputField } from '@/components/ui/InputField';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import { useResponsiveLayout } from '@/hooks/useResponsive';
import { EmployerProfileForm } from '@/types';
import { colors } from '@/theme/colors';
import { userService } from '@/services/user.service';

// Estado inicial vacío para el formulario
const emptyEmployerProfile: EmployerProfileForm = {
  companyName: '',
  contactName: '',
  cargo: '',
  email: '',
  phone: '',
  industry: '',
  numberOfEmployees: '',
  description: '',
  website: '',
  address: '',
  ruc: '',
  tipoEmpresa: '',
  ciudad: '',
};

export function EmployerProfileScreen() {
  const { contentWidth, isDesktop } = useResponsiveLayout();
  const notifications = useNotifications();
  const [form, setForm] = useState<EmployerProfileForm>(emptyEmployerProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await userService.getProfile();

      if (profile.employerProfile) {
        setForm({
          companyName: profile.employerProfile.nombreEmpresa || '',
          contactName: profile.employerProfile.nombreContacto || '',
          email: profile.email,
          phone: profile.telefono || '',
          industry: profile.employerProfile.industry || '',
          numberOfEmployees: profile.employerProfile.numberOfEmployees || '',
          description: profile.employerProfile.description || '',
          website: profile.employerProfile.website || '',
          address: profile.employerProfile.address || '',
          cargo: profile.employerProfile.cargo || '',
          ruc: profile.employerProfile.ruc || '20601234567',
          tipoEmpresa: profile.employerProfile.tipoEmpresa || 'Sociedad Anónima',
          ciudad: profile.employerProfile.ciudad || 'Lima',
        });
      }
    } catch (error: any) {
      notifications.error('No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key: keyof EmployerProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.employer} />
        <Text style={{ marginTop: 16, color: colors.textSecondary }}>Cargando perfil...</Text>
      </View>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await userService.updateProfile({
        nombreCompleto: form.contactName,
        telefono: form.phone,
        employerProfile: {
          ruc: form.ruc,
          tipoEmpresa: form.tipoEmpresa || '',
          industry: form.industry,
          description: form.description,
          website: form.website,
          address: form.address,
          ciudad: form.ciudad || '',
          nombreEmpresa: form.commercialName || form.companyName,
          cargo: form.cargo,
          nombreContacto: form.contactName,
          numberOfEmployees: form.numberOfEmployees,
        },
      });
      notifications.success('Tu perfil ha sido actualizado correctamente.', '¡Excelente!');
    } catch (error: any) {
      notifications.error(error.message || 'No se pudieron guardar los cambios', 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { maxWidth: contentWidth, alignSelf: 'center' }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.pageStack}>
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={[
            styles.surfaceCard,
            styles.block,
            { backgroundColor: '#F59E0B', borderWidth: 0 }
          ]}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerIconContainer}>
              <Feather name="layout" size={24} color="#FFF" />
            </View>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.headerTitleMain}>Identidad empresarial</Text>
              <Text style={styles.headerSubtitleMain} numberOfLines={2}>
                Mantén tus datos actualizados para generar confianza
              </Text>
            </View>
          </View>
        </MotiView>

        <MotiView 
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 100 }}
          style={[styles.surfaceCard, styles.block]}
        >
          <SectionHeader
            title="Identidad Empresarial"
            subtitle="Información general de la organización"
            accentColor={colors.employer}
            icon="layout"
          />
          <View style={styles.sectionBlock}>
            <View style={[styles.formGrid, isDesktop && styles.formGridDesktop]}>
              <View style={[styles.formItem, isDesktop && styles.formItemHalf]}>
                <InputField
                  tone="employer"
                  label="Nombre Comercial"
                  value={form.companyName}
                  readonly
                  badge="SOLO LECTURA"
                />
              </View>
              <View style={[styles.formItem, isDesktop && styles.formItemHalf]}>
                <InputField
                  tone="employer"
                  label="Razón Social"
                  value={form.companyName}
                  readonly
                  badge="SOLO LECTURA"
                />
              </View>
              <View style={[styles.formItem, isDesktop && styles.formItemHalf]}>
                <InputField
                  tone="employer"
                  label="RUC"
                  value={form.ruc}
                  readonly
                  badge="SOLO LECTURA"
                />
              </View>
              <View style={[styles.formItem, isDesktop && styles.formItemHalf]}>
                <InputField
                  tone="employer"
                  label="Tipo de Empresa"
                  value={form.tipoEmpresa}
                  readonly
                  badge="SOLO LECTURA"
                />
              </View>
              <View style={[styles.formItem, isDesktop && styles.formItemHalf]}>
                <InputField
                  tone="employer"
                  label="Sector Industrial"
                  value={form.industry}
                  onChangeText={(text) => updateField('industry', text)}
                  placeholder="Ej. Tecnología, Salud..."
                />
              </View>
              <View style={[styles.formItem, isDesktop && styles.formItemHalf]}>
                <InputField
                  tone="employer"
                  label="Tamaño (Colaboradores)"
                  value={form.numberOfEmployees}
                  onChangeText={(text) => updateField('numberOfEmployees', text)}
                  placeholder="Ej. 10-50"
                />
              </View>
            </View>
            
            <View style={styles.sectionDivider} />

            <View style={styles.formGrid}>
              <View style={styles.formItem}>
                <InputField
                  tone="employer"
                  label="Descripción de la Empresa"
                  value={form.description}
                  onChangeText={(text) => updateField('description', text)}
                  multiline
                  placeholder="Breve reseña sobre la actividad de la empresa..."
                />
              </View>
            </View>
          </View>
        </MotiView>

        <MotiView 
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 200 }}
          style={[styles.surfaceCard, styles.block]}
        >
          <SectionHeader
            title="Ubicación y Canales Digitales"
            subtitle="Presencia física y online"
            accentColor={colors.employer}
            icon="map-pin"
          />
          <View style={styles.sectionBlock}>
            <View style={[styles.formGrid, isDesktop && styles.formGridDesktop]}>
              <View style={[styles.formItem, isDesktop && styles.formItemHalf]}>
                <InputField
                  tone="employer"
                  label="Ciudad"
                  value={form.ciudad || ''}
                  onChangeText={(text) => updateField('ciudad', text)}
                />
              </View>
              <View style={[styles.formItem, isDesktop && styles.formItemHalf]}>
                <InputField
                  tone="employer"
                  label="Sitio Web"
                  value={form.website}
                  onChangeText={(text) => updateField('website', text)}
                  autoCapitalize="none"
                  placeholder="https://..."
                />
              </View>
              <View style={[styles.formItem, isDesktop && styles.formItemHalf]}>
                <InputField
                  tone="employer"
                  label="Dirección Principal"
                  value={form.address}
                  onChangeText={(text) => updateField('address', text)}
                  placeholder="Calle, Número, Ciudad"
                />
              </View>
            </View>
          </View>
        </MotiView>

        <MotiView 
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 300 }}
          style={[styles.surfaceCard, styles.block]}
        >
          <SectionHeader
            title="Contacto Directo"
            subtitle="Información del responsable"
            accentColor={colors.employer}
            icon="user"
          />
          <View style={styles.sectionBlock}>
            <View style={[styles.formGrid, isDesktop && styles.formGridDesktop]}>
              <View style={[styles.formItem, isDesktop && styles.formItemHalf]}>
                <InputField
                  tone="employer"
                  label="Nombre de Contacto"
                  value={form.contactName}
                  onChangeText={(text) => updateField('contactName', text)}
                />
              </View>
              <View style={[styles.formItem, isDesktop && styles.formItemHalf]}>
                <InputField
                  tone="employer"
                  label="Cargo / Posición"
                  value={form.cargo}
                  onChangeText={(text) => updateField('cargo', text)}
                  placeholder="Ej. Gerente de RRHH"
                />
              </View>
              <View style={[styles.formItem, isDesktop && styles.formItemHalf]}>
                <InputField
                  tone="employer"
                  label="Correo Electrónico"
                  value={form.email}
                  readonly
                  autoCapitalize="none"
                />
              </View>
              <View style={[styles.formItem, isDesktop && styles.formItemHalf]}>
                <InputField
                  tone="employer"
                  label="Teléfono / WhatsApp"
                  value={form.phone}
                  onChangeText={(text) => updateField('phone', text)}
                />
              </View>
            </View>
          </View>
        </MotiView>

        <MotiView 
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 400 }}
          style={[styles.surfaceCard, styles.actionBlock]}
        >
          <Button
            tone="employer"
            label={saving ? 'Guardando...' : 'Actualizar Perfil de Empresa'}
            onPress={handleSave}
            loading={saving}
            icon={<Feather name="save" size={20} color="#FFF" />}
          />
        </MotiView>

        <MotiView 
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 500 }}
          style={[styles.surfaceCard, styles.tipBlock]}
        >
          <View style={styles.tipIcon}>
            <Feather name="shield" size={20} color="#F59E0B" />
          </View>
          <Text style={styles.tipText}>
            Tu información será validada por nuestro equipo de seguridad para garantizar la transparencia en los procesos.
          </Text>
        </MotiView>

        <MotiView 
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 600 }}
          style={[styles.saveCard, styles.block]}
        >
          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>
              Los cambios se aplicarán de inmediato y serán visibles para los candidatos.
            </Text>
          </View>
          <Button
            label={saving ? 'Guardando...' : 'Guardar Perfil'}
            onPress={handleSave}
            fullWidth
            tone="employer"
            loading={saving}
            disabled={saving}
            icon={<Feather name="check" size={20} color="#FFF" />}
          />
        </MotiView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    paddingTop: 24,
    paddingBottom: 40,
    width: '100%',
  },
  pageStack: {
    width: '100%',
    gap: 20,
  },
  block: {
    width: '100%',
  },
  surfaceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleMain: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
  },
  headerSubtitleMain: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 10,
  },
  statBoxLight: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
    textAlign: 'center',
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
  saveCard: {
    backgroundColor: '#FFF7ED', // Orange-50 equivalent
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FED7AA', // Orange-200
    padding: 20,
    gap: 16,
  },
  disclaimerBox: {
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  actionBlock: {
    padding: 16,
    gap: 12,
  },
  tipBlock: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FFEDD5',
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 16,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#9A3412',
    lineHeight: 18,
  },
});
