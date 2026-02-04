import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useResponsiveLayout } from '@/hooks/useResponsive';
import { colors } from '@/theme/colors';

interface TermsScreenProps {
  onClose: () => void;
  onBack?: () => void;
  variant?: 'candidate' | 'employer';
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

export function TermsScreen({ onClose, onBack, variant = 'candidate' }: TermsScreenProps) {
  const { contentWidth, horizontalGutter } = useResponsiveLayout();
  const insets = useSafeAreaInsets();

  const isEmbedded = !!onBack;
  const primaryColor = variant === 'employer' ? colors.employer : colors.candidate;
  const bgColor = variant === 'employer' ? '#FFF7ED' : '#F0FDF4';

  const content = (
    <View style={[styles.container, { maxWidth: contentWidth }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.8}>
              <Feather name="arrow-left" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
          <View style={[styles.badge, { backgroundColor: bgColor }]}>
            <Feather name="file-text" size={22} color={primaryColor} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Términos y Condiciones</Text>
            <Text style={styles.subtitle}>Bolsa de Empleo CAIL · Versión 1.0</Text>
          </View>
        </View>
        {!onBack && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.8}>
            <Feather name="x" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Sections */}
      <View style={styles.sections}>
        {sections.map((section) => (
          <View key={section.id} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Feather name={section.icon} size={16} color={primaryColor} />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.description && <Text style={styles.sectionDescription}>{section.description}</Text>}
            {section.bullets?.map((bullet, index) => (
              <View key={index} style={styles.bulletRow}>
                <View style={[styles.bulletDot, { backgroundColor: primaryColor }]} />
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
            {section.footerNote && <Text style={styles.footerNote}>{section.footerNote}</Text>}
          </View>
        ))}
      </View>

      {/* Footer actions */}
      <View style={styles.footer}>
        <Text style={styles.disclaimer}>
          Última actualización: 12 de noviembre de 2025
        </Text>
        <TouchableOpacity 
          onPress={onClose} 
          activeOpacity={0.85} 
          style={[styles.primaryButton, { backgroundColor: primaryColor, shadowColor: primaryColor }]}
        >
          <Text style={styles.primaryButtonText}>Entendido</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Fullscreen mode: floating modal with semi-transparent background
  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'flex-start' }}>
      {/* Background overlay to close modal */}
      <TouchableOpacity 
        style={StyleSheet.absoluteFill} 
        onPress={onClose} 
        activeOpacity={1} 
      />
      
      <View style={{ maxHeight: '90%', width: '100%' }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingHorizontal: horizontalGutter,
            paddingTop: 85, // Manually adjusted to align with background cards
            paddingBottom: 40,
          }}
          pointerEvents="box-none"
        >
          <TouchableOpacity activeOpacity={1}>
            {content}
          </TouchableOpacity>
        </ScrollView>
      </View>
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
    paddingTop: 120,
    paddingBottom: 40,
  },
  embeddedScroll: {
    paddingVertical: 0,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -4,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sections: {
    padding: 24,
    gap: 16,
  },
  sectionCard: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 21,
  },
  footerNote: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    gap: 16,
  },
  primaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  disclaimer: {
    flex: 1,
    fontSize: 12,
    color: '#9CA3AF',
  },
});
