import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useResponsiveLayout } from "@/hooks/useResponsive";

type ApplicationStatus = "pending" | "review" | "accepted" | "rejected";

interface Application {
  id: string;
  candidateName: string;
  initials: string;
  department: string;
  position: string;
  education: string;
  experience: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  receivedDate: string;
  status: ApplicationStatus;
  cvFile?: string;
}

const mockApplications: Application[] = [
  {
    id: "1",
    candidateName: "María Fernanda González",
    initials: "MF",
    department: "Manufactura",
    position: "Ingeniero de Producción",
    education: "Ingeniería Industrial",
    experience: "3 años de exp.",
    email: "mf.gonzalez@email.com",
    phone: "0998765432",
    location: "Loja",
    skills: ["Control de Calidad", "ISO 9001", "Lean Manufacturing"],
    receivedDate: "27/10/2025",
    status: "pending",
    cvFile: "CV_Maria_Fernanda_Gonzalez.pdf",
  },
  {
    id: "2",
    candidateName: "Carlos Alberto Moreno",
    initials: "CA",
    department: "Administración",
    position: "Analista de Recursos Humanos",
    education: "Administración de Empresas",
    experience: "5 años de exp.",
    email: "ca.moreno@email.com",
    phone: "0987654321",
    location: "Loja",
    skills: ["Gestión de Personal", "Recursos Humanos", "Nómina"],
    receivedDate: "26/10/2025",
    status: "pending",
  },
  {
    id: "3",
    candidateName: "Roberto Miguel Sánchez",
    initials: "RM",
    department: "Ingeniería",
    position: "Ingeniero de Proyectos",
    education: "Ingeniería Civil",
    experience: "6 años de exp.",
    email: "rm.sanchez@email.com",
    phone: "0995432109",
    location: "Loja",
    skills: ["AutoCAD", "Gestión de Proyectos", "Presupuestos"],
    receivedDate: "24/10/2025",
    status: "pending",
  },
  {
    id: "4",
    candidateName: "Patricia Elizabeth Jiménez",
    initials: "PE",
    department: "Ingeniería",
    position: "Ingeniero de Proyectos",
    education: "Ingeniería Industrial",
    experience: "4 años de exp.",
    email: "pe.jimenez@email.com",
    phone: "0994321098",
    location: "Loja",
    skills: ["Project Management", "Six Sigma", "Gestión de Riesgos"],
    receivedDate: "23/10/2025",
    status: "review",
  },
  {
    id: "5",
    candidateName: "Fernando José Castillo",
    initials: "FJ",
    department: "Calidad",
    position: "Analista de Calidad",
    education: "Ingeniería Química",
    experience: "3 años de exp.",
    email: "fj.castillo@email.com",
    phone: "0993210987",
    location: "Loja",
    skills: ["Control de Calidad", "ISO 9001", "Auditorías"],
    receivedDate: "22/10/2025",
    status: "accepted",
  },
];

export default function ApplicationsScreen() {
  const { isDesktop, contentWidth, horizontalGutter } = useResponsiveLayout();
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [selectedView, setSelectedView] = useState<"cvs" | "offers">("cvs");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [experienceFilter] = useState("Toda exp.");
  const [statusFilter] = useState("Todos");

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    review: applications.filter((a) => a.status === "review").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
  };

  const filteredApplications = applications.filter((app) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      query.length === 0 ||
      app.candidateName.toLowerCase().includes(query) ||
      app.skills.some((s) => s.toLowerCase().includes(query)) ||
      app.position.toLowerCase().includes(query);
    return matchesSearch;
  });

  const groupedApplications = filteredApplications.reduce((acc, app) => {
    if (!acc[app.position]) {
      acc[app.position] = [];
    }
    acc[app.position].push(app);
    return acc;
  }, {} as Record<string, Application[]>);

  const openEvaluationModal = (app: Application) => {
    setSelectedApplication(app);
    setShowEvaluationModal(true);
  };

  const handleSelectCandidate = () => {
    if (selectedApplication) {
      const updated = applications.map((app) =>
        app.id === selectedApplication.id ? { ...app, status: "accepted" as ApplicationStatus } : app,
      );
      setApplications(updated);
      setShowEvaluationModal(false);
      setSelectedApplication(null);
    }
  };

  const handleReject = () => {
    if (selectedApplication) {
      const updated = applications.map((app) =>
        app.id === selectedApplication.id ? { ...app, status: "rejected" as ApplicationStatus } : app,
      );
      setApplications(updated);
      setShowEvaluationModal(false);
      setSelectedApplication(null);
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const badges = {
      pending: { label: "Pendiente", bg: "#FEF3C7", color: "#92400E" },
      review: { label: "En Revisión", bg: "#DBEAFE", color: "#1E40AF" },
      accepted: { label: "Aceptado", bg: "#D1FAE5", color: "#065F46" },
      rejected: { label: "Rechazado", bg: "#FEE2E2", color: "#991B1B" },
    };
    return badges[status] || badges.pending;
  };

  return (
    <View style={[styles.container, { paddingHorizontal: horizontalGutter }]}>
      <ScrollView
        style={styles.fullScroll}
        contentContainerStyle={[styles.scrollContent, { maxWidth: contentWidth, alignSelf: "center" }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageStack}>
          <View style={[styles.surfaceCard, styles.block]}>
            <View style={styles.statsContainer}>
              <StatBox label="Total" value={stats.total} isDesktop={isDesktop} />
              <StatBox label="Pendiente" value={stats.pending} color="#F59E0B" isDesktop={isDesktop} />
              <StatBox label="En Revisión" value={stats.review} color="#3B82F6" isDesktop={isDesktop} />
              <StatBox label="Aceptado" value={stats.accepted} color="#10B981" isDesktop={isDesktop} />
            </View>
          </View>

          <View style={[styles.surfaceCard, styles.block, styles.filtersCard]}>
            <View style={styles.searchBox}>
              <Feather name="search" size={16} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Buscar por nombre, habilidades..."
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.filterRow}>
              <TouchableOpacity style={styles.filterButton}>
                <Text style={styles.filterButtonText}>{experienceFilter}</Text>
                <Feather name="chevron-down" size={16} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterButton}>
                <Text style={styles.filterButtonText}>{statusFilter}</Text>
                <Feather name="chevron-down" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.surfaceCard, styles.block, styles.viewTabsCard]}>
            <TouchableOpacity
              style={[styles.viewTab, selectedView === "cvs" && styles.viewTabActive]}
              onPress={() => setSelectedView("cvs")}
            >
              <Feather name="file-text" size={16} color={selectedView === "cvs" ? "#1F2937" : "#6B7280"} />
              <Text style={[styles.viewTabText, selectedView === "cvs" && styles.viewTabTextActive]}>
                CVs Espontáneos({applications.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewTab, selectedView === "offers" && styles.viewTabActive]}
              onPress={() => setSelectedView("offers")}
            >
              <Feather name="briefcase" size={16} color={selectedView === "offers" ? "#1F2937" : "#6B7280"} />
              <Text style={[styles.viewTabText, selectedView === "offers" && styles.viewTabTextActive]}>
                Por Ofertas (3)
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.surfaceCard, styles.block]}>
            <View style={styles.infoBanner}>
              <Feather name="info" size={16} color="#1E40AF" />
              <Text style={styles.infoBannerText}>
                {selectedView === "cvs"
                  ? "CVs Recibidos Espontáneamente: Candidatos que enviaron su hoja de vida sin aplicar a una oferta específica. Puedes revisar sus perfiles y contactarlos directamente."
                  : "Postulaciones por Oferta: Candidatos que aplicaron específicamente a tus ofertas de trabajo publicadas. Puedes clasificarlos por experiencia, formación y compatibilidad."}
              </Text>
            </View>
          </View>

          <View style={[styles.surfaceCard, styles.block, styles.listCard]}>
            {selectedView === "cvs"
              ? filteredApplications.length > 0 ? (
                  filteredApplications.map((app) => (
                    <ApplicationCard
                      key={app.id}
                      application={app}
                      onPress={() => openEvaluationModal(app)}
                      getStatusBadge={getStatusBadge}
                    />
                  ))
                ) : (
                  <EmptyState message="No hay CVs que coincidan. Ajusta filtros o busca por nombre/habilidad." />
                )
              : Object.entries(groupedApplications).length > 0 ? (
                  Object.entries(groupedApplications).map(([position, apps]) => (
                    <View key={position} style={styles.positionGroup}>
                      <View style={styles.positionHeader}>
                        <Feather name="briefcase" size={16} color="#F59E0B" />
                        <Text style={styles.positionTitle}>{position}</Text>
                        <Text style={styles.positionCount}>{apps.length} postulaciones</Text>
                      </View>
                      {apps.map((app) => (
                        <ApplicationCard
                          key={app.id}
                          application={app}
                          onPress={() => openEvaluationModal(app)}
                          getStatusBadge={getStatusBadge}
                          compact
                        />
                      ))}
                    </View>
                  ))
                ) : (
                  <EmptyState message="No hay postulaciones agrupadas. Cambia a la vista CVs o ajusta filtros." />
                )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showEvaluationModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEvaluationModal(false)}
      >
        <View
          style={[
            styles.modalOverlay,
            isDesktop ? styles.modalOverlayDesktop : styles.modalOverlayMobile,
          ]}
        >
          <View
            style={[
              styles.modalContent,
              isDesktop ? styles.modalContentDesktop : styles.modalContentMobile,
              { maxWidth: isDesktop ? 980 : contentWidth },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Evaluar Postulación</Text>
              <TouchableOpacity onPress={() => setShowEvaluationModal(false)}>
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedApplication && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.candidateHeader}>
                  <View style={styles.avatarLarge}>
                    <Text style={styles.avatarLargeText}>{selectedApplication.initials}</Text>
                  </View>
                  <View style={styles.candidateInfo}>
                    <Text style={styles.candidateName}>{selectedApplication.candidateName}</Text>
                    <Text style={styles.candidateDepartment}>{selectedApplication.department}</Text>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Información de Contacto</Text>
                  <View style={styles.contactRow}>
                    <Feather name="mail" size={14} color="#6B7280" />
                    <Text style={styles.contactText}>{selectedApplication.email}</Text>
                  </View>
                  <View style={styles.contactRow}>
                    <Feather name="phone" size={14} color="#6B7280" />
                    <Text style={styles.contactText}>{selectedApplication.phone}</Text>
                  </View>
                  <View style={styles.contactRow}>
                    <Feather name="map-pin" size={14} color="#6B7280" />
                    <Text style={styles.contactText}>{selectedApplication.location}</Text>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Formación</Text>
                  <View style={styles.infoRow}>
                    <Feather name="award" size={14} color="#1F2937" />
                    <Text style={styles.infoText}>{selectedApplication.education}</Text>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Experiencia</Text>
                  <View style={styles.infoRow}>
                    <Feather name="briefcase" size={14} color="#1F2937" />
                    <Text style={styles.infoText}>{selectedApplication.experience}</Text>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.sectionTitle}>Habilidades</Text>
                  <View style={styles.skillsContainer}>
                    {selectedApplication.skills.map((skill) => (
                      <View key={skill} style={styles.skillChip}>
                        <Text style={styles.skillChipText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {selectedApplication.cvFile && (
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Curriculum Vitae</Text>
                    <TouchableOpacity style={styles.cvDownload}>
                      <Feather name="file-text" size={16} color="#6B7280" />
                      <Text style={styles.cvFileName}>{selectedApplication.cvFile}</Text>
                      <Feather name="download" size={16} color="#F59E0B" />
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.selectButton} onPress={handleSelectCandidate}>
                <Text style={styles.selectButtonText}>Agregar Candidato</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
                <Text style={styles.rejectButtonText}>Rechazar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function StatBox({ label, value, color, isDesktop }: { label: string; value: number; color?: string; isDesktop: boolean }) {
  return (
    <View style={[styles.statBox, !isDesktop && styles.statBoxMobile]}>
      <Text style={[styles.statNumber, color ? { color } : undefined]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ApplicationCard({
  application,
  onPress,
  getStatusBadge,
  compact = false,
}: {
  application: Application;
  onPress: () => void;
  getStatusBadge: (status: ApplicationStatus) => { label: string; bg: string; color: string };
  compact?: boolean;
}) {
  const statusBadge = getStatusBadge(application.status);

  return (
    <TouchableOpacity style={styles.applicationCard} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <View style={[styles.avatar, statusBadge && { backgroundColor: statusBadge.bg }]}>
            <Text style={styles.avatarText}>{application.initials}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{application.candidateName}</Text>
            <Text style={styles.cardDepartment}>{application.department}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
          <Text style={[styles.statusBadgeText, { color: statusBadge.color }]}>{statusBadge.label}</Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <Detail icon="award" text={application.education} />
        <Detail icon="calendar" text={application.experience} />
        <Detail icon="mail" text={application.email} />
        <Detail icon="phone" text={application.phone} />
        <Detail icon="map-pin" text={application.location} />
      </View>

      {!compact && (
        <>
          <View style={styles.skillsList}>
            <Text style={styles.skillsLabel}>Habilidades principales:</Text>
            <View style={styles.skillsRow}>
              {application.skills.map((skill) => (
                <View key={skill} style={styles.skillTag}>
                  <Text style={styles.skillTagText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.receivedDate}>Recibido: {application.receivedDate}</Text>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.viewProfileButton} onPress={onPress}>
                <Feather name="eye" size={14} color="#1F2937" />
                <Text style={styles.viewProfileText}>Ver Perfil</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </TouchableOpacity>
  );
}

function Detail({ icon, text }: { icon: keyof typeof Feather.glyphMap; text: string }) {
  return (
    <View style={styles.detailRow}>
      <Feather name={icon} size={12} color="#6B7280" />
      <Text style={styles.detailText}>{text}</Text>
    </View>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  fullScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
    width: "100%",
  },
  pageStack: {
    width: "100%",
    gap: 16,
  },
  block: {
    width: "100%",
  },
  surfaceCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    padding: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  statBox: {
    flex: 1,
    minWidth: 120,
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statBoxMobile: {
    flexBasis: "48%",
    maxWidth: "48%",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    fontWeight: "600",
  },
  filtersCard: {
    gap: 12,
  },
  filtersContainer: {
    paddingVertical: 12,
    gap: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  filterButton: {
    flexGrow: 1,
    minWidth: 150,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
  },
  viewTabsCard: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
    paddingVertical: 12,
  },
  viewTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
  },
  viewTabActive: {
    backgroundColor: "#EEF2FF",
  },
  viewTabText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  viewTabTextActive: {
    color: "#1F2937",
    fontWeight: "700",
  },
  infoBanner: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: "#1E40AF",
    lineHeight: 18,
  },
  listCard: {
    gap: 12,
  },
  applicationsList: {
    width: "100%",
    gap: 12,
  },
  positionGroup: {
    marginBottom: 16,
  },
  positionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  positionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  positionCount: {
    fontSize: 13,
    color: "#6B7280",
  },
  applicationCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  cardLeft: {
    flexDirection: "row",
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  cardDepartment: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  cardDetails: {
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: "#6B7280",
  },
  skillsList: {
    marginBottom: 12,
  },
  skillsLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
  },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skillTag: {
    backgroundColor: "#EEF2FF",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  skillTagText: {
    fontSize: 12,
    color: "#3730A3",
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  receivedDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  viewProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  viewProfileText: {
    fontSize: 12,
    color: "#1F2937",
    fontWeight: "600",
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  statusButtonText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 12,
  },
  modalOverlayDesktop: {
    justifyContent: "center",
    paddingVertical: 24,
  },
  modalOverlayMobile: {
    justifyContent: "flex-end",
    paddingVertical: 12,
    paddingBottom: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxHeight: "92%",
    alignSelf: "center",
    shadowColor: "#0F172A",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  modalContentDesktop: {
    padding: 24,
  },
  modalContentMobile: {
    padding: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  modalBody: {
    maxHeight: 480,
    marginBottom: 20,
  },
  candidateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLargeText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  candidateDepartment: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  modalSection: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  contactText: {
    fontSize: 13,
    color: "#374151",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#374151",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillChip: {
    backgroundColor: "#EEF2FF",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  skillChipText: {
    color: "#1F2937",
    fontSize: 12,
    fontWeight: "700",
  },
  skillChipModal: {},
  cvDownload: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cvFileName: {
    flex: 1,
    fontSize: 13,
    color: "#1F2937",
    fontWeight: "500",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  selectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 10,
  },
  selectButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  rejectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  rejectButtonText: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "700",
  },
  emptyState: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  emptyText: {
    color: "#4B5563",
    fontSize: 13,
    textAlign: "center",
  },
});
