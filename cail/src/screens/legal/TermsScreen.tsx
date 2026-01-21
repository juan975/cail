import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useResponsiveLayout } from '@/hooks/useResponsive';
import { colors } from '@/theme/colors';

interface TermsScreenProps {
  onClose: () => void;
  onBack?: () => void;
}

type Section = {
  id: string;
  title: string;
  icon: keyof typeof Feather.glyphMap;
  description?: string;
  bullets?: string[];
  footerNote?: string;
};

const sections: Section[] = [
  {
    id: 'info',
    title: '1. Información General y Dominio',
    icon: 'map-pin',
    description:
      'La Bolsa de Empleo Conjunta es administrada por la Cámara de Industrias de Loja (CAIL). Domicilio: Calle Agustín Carrión Palacios y Av. Salvador Bustamante Celi (Complejo Ferial Simón Bolívar).',
    bullets: [
      'Contacto: secretaria@camaradeindustriasdeloja.ec',
      'Teléfono: 072-613234',
    ],
  },
  {
    id: 'scope',
    title: '2. Objeto y Ámbito de Aplicación',
    icon: 'globe',
    description:
      'La plataforma actúa como un marketplace de servicios laborales que conecta candidatos y empresas para facilitar reclutamiento y selección.',
    bullets: [
      'Cláusula de limitación geográfica: el servicio se limita a oportunidades y empresas que operan en Loja, Ecuador.',
      'No existe relación laboral entre el Usuario y CAIL.',
      'CAIL es un intermediario tecnológico; no garantiza la contratación ni la veracidad de las ofertas de terceros.',
    ],
  },
  {
    id: 'definitions',
    title: '3. Definiciones',
    icon: 'book-open',
    bullets: [
      'CAIL: administrador de la plataforma.',
      'Servicios: funcionalidades de registro de perfil, publicación de ofertas, postulación y gestión de procesos.',
      'Usuario: persona natural (Candidato) o jurídica (Empleador/Empresa) que navega y usa la plataforma.',
      'Candidato: usuario que busca empleo y registra su hoja de vida.',
      'Empleador: usuario corporativo que publica ofertas de trabajo.',
    ],
  },
  {
    id: 'acceptance',
    title: '4. Aceptación y Capacidad Legal',
    icon: 'user-check',
    bullets: [
      'Uso exclusivo para mayores de 18 años con capacidad legal.',
      'Está prohibido el registro y uso por menores de edad.',
      'Al crear una cuenta, el usuario declara cumplir con este requisito.',
    ],
  },
  {
    id: 'duties',
    title: '5. Obligaciones de los Usuarios',
    icon: 'check-circle',
    bullets: [
      'Proporcionar información veraz, precisa y actualizada.',
      'No suplantar identidades ni usar datos falsos.',
      'No introducir virus ni código malicioso.',
      'No realizar explotación comercial, venta de perfiles o extracción masiva de datos.',
      'Usar el servicio solo para búsqueda de empleo o reclutamiento de personal.',
      'Mantener la confidencialidad de sus credenciales y no compartir la cuenta.',
    ],
    footerNote: 'CAIL no se responsabiliza por la veracidad de datos divulgados por usuarios en CVs u ofertas.',
  },
  {
    id: 'free',
    title: '6. Modelo de Servicio Gratuito',
    icon: 'gift',
    bullets: [
      'Acceso y uso gratuito para candidatos y empleadores.',
      'CAIL no cobra comisiones, suscripciones ni tarifas por publicación.',
      'No aplican políticas de devolución, facturación ni reembolso.',
    ],
  },
  {
    id: 'accuracy',
    title: '7. Actualización de la Información',
    icon: 'refresh-ccw',
    bullets: [
      'CAIL hará su mejor esfuerzo por mantener la información precisa.',
      'El usuario debe verificar la vigencia de las ofertas antes de postular.',
    ],
  },
  {
    id: 'ip',
    title: '8. Derechos de Propiedad Intelectual',
    icon: 'shield',
    bullets: [
      'CAIL es titular del diseño, código fuente, software y marcas de la plataforma.',
      'Licencia: uso limitado, revocable y no exclusivo para intermediación laboral.',
      'Contenido del usuario: el usuario conserva propiedad y otorga a CAIL licencia gratuita para alojar y procesar su información.',
      'Prohibido copiar, modificar, distribuir o vender el contenido sin autorización escrita.',
    ],
  },
  {
    id: 'privacy',
    title: '9. Protección de Datos Personales',
    icon: 'lock',
    bullets: [
      'El tratamiento de datos se rige por la Política de Protección de Datos Personales de CAIL.',
      'Al usar el servicio, el usuario acepta compartir datos con empresas reclutadoras (candidatos) o postulantes (empleadores) para fines de selección.',
    ],
  },
  {
    id: 'links',
    title: '10. Enlaces de Terceros',
    icon: 'external-link',
    bullets: [
      'La plataforma puede contener enlaces a sitios de terceros.',
      'CAIL no es responsable por contenido, políticas o prácticas de los sitios enlazados.',
    ],
  },
  {
    id: 'liability',
    title: '11. Exclusión de Garantías y Limitación de Responsabilidad',
    icon: 'alert-triangle',
    bullets: [
      'El servicio se presta “tal cual” y “según disponibilidad”.',
      'CAIL no responde por interrupciones, virus o fallos de conexión ajenos.',
      'No garantiza el éxito o fracaso de contrataciones ni la conducta de usuarios.',
      'Responsabilidad total limitada a USD $0.00 por ser un servicio gratuito.',
    ],
  },
  {
    id: 'comms',
    title: '12. Comunicaciones',
    icon: 'mail',
    bullets: [
      'El usuario acepta recibir comunicaciones por correo, WhatsApp o SMS sobre postulaciones, seguridad o nuevas funciones.',
    ],
  },
  {
    id: 'changes',
    title: '13. Modificaciones',
    icon: 'edit-3',
    bullets: [
      'CAIL puede modificar estos términos en cualquier momento.',
      'Las modificaciones rigen desde su publicación; el uso continuado implica aceptación.',
    ],
  },
  {
    id: 'law',
    title: '14. Legislación y Solución de Conflictos',
    icon: 'info',
    bullets: [
      'Se rigen por las leyes de la República del Ecuador.',
      'Las partes intentarán una negociación informal de 30 días antes de escalar.',
      'Cláusula arbitral: el conflicto se resolverá mediante arbitraje administrado por el Centro de Arbitraje y Mediación de la Cámara de Industrias de Loja (o conforme a la Ley de Arbitraje y Mediación de Ecuador) en la ciudad de Loja. Idioma: español. Un árbitro.',
    ],
  },
];

export function TermsScreen({ onClose, onBack }: TermsScreenProps) {
  const { contentWidth, horizontalGutter } = useResponsiveLayout();

  // When embedded (onBack is present), render without full-screen wrappers
  // to avoid nested ScrollView issues
  const isEmbedded = !!onBack;

  const content = (
    <View style={[styles.container, { maxWidth: contentWidth }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.closeButton} activeOpacity={0.8}>
              <Feather name="arrow-left" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
          <View style={styles.badge}>
            <Feather name="file-text" size={18} color={colors.candidateDark} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Términos y Condiciones de Uso</Text>
            <Text style={styles.subtitle}>Bolsa de Empleo CAIL · Versión 1.0</Text>
          </View>
        </View>
        {!onBack && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.8}>
            <Feather name="x" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Meta Info */}
      <View style={styles.metaRow}>
        <MetaPill icon="calendar" label="Última actualización" value="12 de noviembre de 2025" />
        <MetaPill icon="map" label="Ámbito" value="Loja, Ecuador" />
        <MetaPill icon="shield" label="Al usar, aceptas estos términos" value="Aplicación y sitio web" />
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <SummaryCard
          icon="check-circle"
          title="Aceptación"
          text="El uso implica lectura y aceptación íntegra de estos términos."
        />
        <SummaryCard
          icon="globe"
          title="Uso local"
          text="Enfocado en oportunidades laborales de la ciudad y provincia de Loja."
        />
        <SummaryCard
          icon="gift"
          title="Servicio gratuito"
          text="Sin comisiones ni suscripciones para candidatos o empleadores."
        />
      </View>

      {/* Sections */}
      <View style={styles.sections}>
        {sections.map((section) => (
          <View key={section.id} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Feather name={section.icon} size={16} color={colors.candidateDark} />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.description && <Text style={styles.sectionDescription}>{section.description}</Text>}
            {section.bullets?.map((bullet, index) => (
              <View key={index} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
            {section.footerNote && <Text style={styles.footerNote}>{section.footerNote}</Text>}
          </View>
        ))}
      </View>

      {/* Footer actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={onClose} activeOpacity={0.85} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Aceptar Términos y Condiciones</Text>
        </TouchableOpacity>
        <Text style={styles.disclaimer}>
          Estos términos pueden actualizarse periódicamente. Te avisaremos cuando se publiquen cambios
          relevantes.
        </Text>
      </View>
    </View>
  );

  // Embedded mode: just the content with internal scroll, no gradient wrapper
  if (isEmbedded) {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.embeddedScroll, { paddingHorizontal: horizontalGutter }]}
        nestedScrollEnabled={true}
      >
        {content}
      </ScrollView>
    );
  }

  // Fullscreen mode: with gradient and SafeAreaView
  return (
    <LinearGradient colors={['#0B7A4D', '#0A6B43', '#085C3A']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalGutter }]}
        >
          {content}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function MetaPill({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metaPill}>
      <Feather name={icon} size={14} color={colors.textPrimary} />
      <View style={styles.metaText}>
        <Text style={styles.metaLabel}>{label}</Text>
        <Text style={styles.metaValue}>{value}</Text>
      </View>
    </View>
  );
}

function SummaryCard({
  icon,
  title,
  text,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryIcon}>
        <Feather name={icon} size={16} color={colors.candidateDark} />
      </View>
      <Text style={styles.summaryTitle}>{title}</Text>
      <Text style={styles.summaryText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    paddingVertical: 24,
  },
  embeddedScroll: {
    paddingVertical: 16,
    paddingBottom: 32,
  },
  container: {
    backgroundColor: '#F8FAFB',
    borderRadius: 20,
    padding: 18,
    gap: 16,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  badge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.candidateSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    minWidth: 240,
  },
  metaText: {
    gap: 2,
  },
  metaLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  summaryCard: {
    flex: 1,
    minWidth: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    gap: 6,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.candidateSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  summaryText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  sections: {
    gap: 12,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.candidateSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  sectionDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: colors.candidateDark,
    marginTop: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  footerNote: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 18,
  },
  actions: {
    gap: 10,
    alignItems: 'flex-start',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.candidateDark,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
