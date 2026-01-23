import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useResponsiveLayout } from "@/hooks/useResponsive";
import { applicationsService } from "@/services/applications.service";
import { offersService } from "@/services/offers.service";
import { ApplicationWithCandidate, ApplicationStatus as ApiStatus } from "@/types/applications.types";

type ApplicationStatus = "pending" | "review" | "accepted" | "rejected";

// Mapea estado de API a estado local
const mapApiStatus = (status: ApiStatus): ApplicationStatus => {
  const statusMap: Record<ApiStatus, ApplicationStatus> = {
    'PENDIENTE': 'pending',
    'EN_REVISION': 'review',
    'ACEPTADA': 'accepted',
    'RECHAZADA': 'rejected'
  };
  return statusMap[status] || 'pending';
};

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
  resumenProfesional?: string;
  workHistory?: any[];
  cvFile?: string;
  matchScore?: number;
}

// Convierte aplicación de API a formato local
const mapApiToLocal = (app: ApplicationWithCandidate, offerTitle: string): Application => {
  const candidato = app.candidato;
  const nombre = candidato?.nombreCompleto || 'Candidato sin nombre';
  const initials = nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const fecha = new Date(app.fechaAplicacion);
  
  // Helper to standardizing empty values
  const getValue = (val: any) => val ? val : '';

  return {
    id: app.idAplicacion,
    candidateName: nombre,
    initials,
    department: getValue(candidato?.nivelEducativo) || 'Perfil General',
    position: offerTitle,
    education: getValue(candidato?.nivelEducativo),
    experience: candidato?.experienciaAnios ? `${candidato.experienciaAnios} años de exp.` : '',
    email: getValue(candidato?.email),
    phone: getValue(candidato?.telefono),
    location: getValue(candidato?.ciudad),
    skills: [...(candidato?.habilidadesTecnicas || []), ...(candidato?.habilidadesBlandas || [])].slice(0, 5),
    receivedDate: fecha.toLocaleDateString('es-EC'),
    status: mapApiStatus(app.estado),
    matchScore: app.matchScore,
    resumenProfesional: candidato?.resumenProfesional,
    workHistory: (candidato as any)?.experienciaLaboral || (candidato as any)?.candidateProfile?.experienciaLaboral || [],
    cvFile: app.candidato?.cvUrl,
  };
};

// Los datos mock ya no se utilizan - ahora se cargan desde la API

export default function ApplicationsScreen() {
  const { isDesktop, contentWidth, horizontalGutter } = useResponsiveLayout();

  // Estados de datos
  const [applications, setApplications] = useState<Application[]>([]);
  const [groupedByOffer, setGroupedByOffer] = useState<{ offerId: string; offerTitle: string; apps: Application[] }[]>([]);

  // Estados de UI
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedView] = useState<"all" | "byOffer">("byOffer");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("Toda exp.");
  const [statusFilter, setStatusFilter] = useState("Todos");

  // Estados para Modal de Selección
  const [selectionModalVisible, setSelectionModalVisible] = useState(false);
  const [selectionTitle, setSelectionTitle] = useState("");
  const [selectionOptions, setSelectionOptions] = useState<string[]>([]);
  const [onSelectOption, setOnSelectOption] = useState<(option: string) => void>(() => (val: string) => {});

  const EXPERIENCE_OPTIONS = ["Toda exp.", "Sin experiencia", "1-2 años", "3-5 años", "5+ años"];
  const STATUS_OPTIONS = ["Todos", "Pendiente", "En Revisión", "Aceptado", "Rechazado"];

  // Cargar aplicaciones desde la API
  const loadApplications = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Obtener ofertas del reclutador
      const myOffers = await offersService.getMyOffers();

      // Para cada oferta, obtener aplicaciones enriquecidas
      const groupsPromises = myOffers.map(async (offer) => {
        try {
          const apps = await applicationsService.getOfferApplicationsWithCandidates(offer.idOferta);
          return {
            offerId: offer.idOferta,
            offerTitle: offer.titulo,
            apps: apps.map(app => mapApiToLocal(app, offer.titulo))
          };
        } catch (err) {
          console.warn(`Error loading apps for offer ${offer.idOferta}:`, err);
          return { offerId: offer.idOferta, offerTitle: offer.titulo, apps: [] };
        }
      });

      const groups = await Promise.all(groupsPromises);
      setGroupedByOffer(groups);

      // Flatten para vista de todas
      const allApps = groups.flatMap(g => g.apps);
      setApplications(allApps);
    } catch (err: any) {
      console.error('Error loading applications:', err);
      setError(err.message || 'Error al cargar las postulaciones');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleRefresh = () => loadApplications(true);

  const filteredGroups = useMemo(() => {
    return groupedByOffer.map(group => {
      const filteredApps = group.apps.filter(app => {
        // Filtro de búsqueda
        const query = searchQuery.toLowerCase();
        const matchesSearch = query.length === 0 ||
          app.candidateName.toLowerCase().includes(query) ||
          app.skills.some(s => s.toLowerCase().includes(query)) ||
          app.position.toLowerCase().includes(query);

        // Filtro de experiencia (match mejorado)
        let matchesExperience = true;
        if (experienceFilter !== "Toda exp.") {
          const expLower = app.experience.toLowerCase();
          const filterLower = experienceFilter.toLowerCase();
          
          if (experienceFilter === "Sin experiencia") {
            matchesExperience = expLower.includes("0") || expLower.includes("sin") || expLower.includes("no tiene");
          } else {
            // Ejemplo: if filter is "1-2 años", match if app says "1" or "2"
            const filterNumbers = experienceFilter.match(/\d+/g) || [];
            matchesExperience = filterNumbers.some(num => expLower.includes(num)) || expLower.includes(filterLower);
          }
        }

        // Filtro de estado
        let matchesStatus = true;
        if (statusFilter !== "Todos") {
          const statusMap: Record<string, string> = {
            "Pendiente": "pending",
            "En Revisión": "review",
            "Aceptado": "accepted",
            "Rechazado": "rejected"
          };
          matchesStatus = app.status === statusMap[statusFilter];
        }

        return matchesSearch && matchesExperience && matchesStatus;
      });

      return { ...group, apps: filteredApps };
    }).filter(group => group.apps.length > 0);
  }, [groupedByOffer, searchQuery, experienceFilter, statusFilter]);

  const stats = useMemo(() => {
    const allFiltered = filteredGroups.flatMap(g => g.apps);
    return {
      total: allFiltered.length,
      pending: allFiltered.filter((a) => a.status === "pending").length,
      review: allFiltered.filter((a) => a.status === "review").length,
      accepted: allFiltered.filter((a) => a.status === "accepted").length,
    };
  }, [filteredGroups]);

  const openSelection = (title: string, options: string[], onSelect: (val: string) => void) => {
    setSelectionTitle(title);
    setSelectionOptions(options);
    setOnSelectOption(() => onSelect);
    setSelectionModalVisible(true);
  };

  const openEvaluationModal = async (app: Application) => {
    setSelectedApplication(app);
    setShowEvaluationModal(true);

    // Auto-update to review if pending
    if (app.status === 'pending') {
      try {
        await applicationsService.updateApplicationStatus(app.id, 'EN_REVISION');
        // Update locally
        setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: 'review' } : a));
        setGroupedByOffer(prev => prev.map(group => ({
          ...group,
          apps: group.apps.map(a => a.id === app.id ? { ...a, status: 'review' } : a)
        })));
      } catch (err) {
        console.error('Error auto-updating application status:', err);
      }
    }
  };

  const handleSelectCandidate = async () => {
    if (selectedApplication) {
      try {
        setIsLoading(true);
        await applicationsService.updateApplicationStatus(selectedApplication.id, 'ACEPTADA');
        Alert.alert('Éxito', 'Candidato aceptado correctamente');
        setShowEvaluationModal(false);
        setSelectedApplication(null);
        loadApplications(true);
      } catch (error) {
        console.error('Error accepting candidate:', error);
        Alert.alert('Error', 'No se pudo aceptar al candidato. Intenta nuevamente.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleReject = async () => {
    if (selectedApplication) {
      Alert.alert(
        'Rechazar Candidato',
        '¿Estás seguro de que quieres rechazar esta postulación?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Rechazar',
            style: 'destructive',
            onPress: async () => {
              try {
                setIsLoading(true);
                await applicationsService.updateApplicationStatus(selectedApplication.id, 'RECHAZADA');
                setShowEvaluationModal(false);
                setSelectedApplication(null);
                loadApplications(true);
              } catch (error) {
                console.error('Error rejecting candidate:', error);
                Alert.alert('Error', 'No se pudo rechazar la postulación.');
              } finally {
                setIsLoading(false);
              }
            }
          }
        ]
      );
    }
  };

  const handleDownloadCV = () => {
    if (selectedApplication?.cvFile) {
      Linking.openURL(selectedApplication.cvFile).catch(err =>
        Alert.alert('Error', 'No se pudo abrir el enlace del CV')
      );
    } else {
      Alert.alert('Información', 'Este candidato no ha adjuntado un CV');
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
    <View style={styles.container}>
      <ScrollView
        style={styles.fullScroll}
        contentContainerStyle={[styles.scrollContent, { maxWidth: contentWidth, alignSelf: "center" }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageStack}>
          <View style={[styles.surfaceCard, styles.block, { backgroundColor: '#F59E0B' }]}>
            <View style={styles.headerRow}>
              <View style={styles.headerIconContainer}>
                <Feather name="users" size={24} color="#FFF" />
              </View>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.headerTitleMain}>Postulaciones Recibidas</Text>
                <Text style={styles.headerSubtitleMain} numberOfLines={2}>
                  Gestiona candidatos de tus ofertas
                </Text>
              </View>
            </View>
            <View style={[styles.statsContainer, { marginTop: 16 }]}>
              <StatBox label="Total" value={stats.total} isDesktop={isDesktop} light />
              <StatBox label="Pendientes" value={stats.pending} isDesktop={isDesktop} light />
              <StatBox label="En Revisión" value={stats.review} isDesktop={isDesktop} light />
              <StatBox label="Aceptados" value={stats.accepted} isDesktop={isDesktop} light />
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
            <View style={styles.chipContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {STATUS_OPTIONS.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.chip, statusFilter === status && styles.chipActive]}
                    onPress={() => setStatusFilter(status)}
                  >
                    <Text style={[styles.chipText, statusFilter === status && styles.chipTextActive]}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {EXPERIENCE_OPTIONS.map((exp) => (
                  <TouchableOpacity
                    key={exp}
                    style={[styles.chip, experienceFilter === exp && styles.chipActive]}
                    onPress={() => setExperienceFilter(exp)}
                  >
                    <Text style={[styles.chipText, experienceFilter === exp && styles.chipTextActive]}>
                      {exp}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

            <View style={styles.infoBanner}>
              <Feather name="info" size={16} color="#1E40AF" />
              <Text style={styles.infoBannerText}>
                Postulaciones agrupadas por oferta. Puedes clasificarlos por experiencia y estado.
              </Text>
            </View>

          <View style={[styles.surfaceCard, styles.block, styles.listCard]}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Cargando postulaciones...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={32} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                  <Text style={styles.retryButtonText}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            ) : filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <View key={group.offerId} style={styles.positionGroup}>
                  <View style={styles.positionHeader}>
                    <Feather name="briefcase" size={16} color="#F59E0B" />
                    <Text style={styles.positionTitle}>{group.offerTitle}</Text>
                    <Text style={styles.positionCount}>{group.apps.length} postulaciones</Text>
                  </View>
                  {group.apps.map((app) => (
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
              <EmptyState message="No se encontraron postulaciones que coincidan con los filtros seleccionados." />
            )}
          </View>
        </View>
      </ScrollView>

      <SelectionModal
        visible={selectionModalVisible}
        title={selectionTitle}
        options={selectionOptions}
        onSelect={onSelectOption}
        onClose={() => setSelectionModalVisible(false)}
      />

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
              { maxWidth: isDesktop ? 980 : '100%' },
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
                {/* Profile Header */}
                <View style={styles.candidateProfileHeader}>
                  <View style={styles.avatarLarge}>
                    <Text style={styles.avatarLargeText}>{selectedApplication?.initials}</Text>
                  </View>
                  <View style={styles.candidateInfo}>
                    <Text style={styles.candidateName}>{selectedApplication?.candidateName}</Text>
                    <View style={styles.positionBadge}>
                      <Feather name="briefcase" size={12} color="#F59E0B" />
                      <Text style={styles.candidatePositionText}>{selectedApplication?.position}</Text>
                    </View>
                  </View>
                </View>

                {/* Professional Summary */}
                {selectedApplication.resumenProfesional && (
                  <View style={styles.modalSection}>
                    <View style={styles.sectionHeader}>
                      <Feather name="user" size={16} color="#374151" />
                      <Text style={styles.sectionTitle}>Resumen Profesional</Text>
                    </View>
                    <View style={styles.summaryCard}>
                      <Text style={styles.summaryText}>{selectedApplication?.resumenProfesional}</Text>
                    </View>
                  </View>
                )}

                {/* Contact Info */}
                <View style={styles.modalSection}>
                  <View style={styles.sectionHeader}>
                    <Feather name="info" size={16} color="#374151" />
                    <Text style={styles.sectionTitle}>Información de Contacto</Text>
                  </View>
                  <View style={styles.infoGrid}>
                    <View style={styles.contactRow}>
                      <View style={styles.contactIcon}>
                        <Feather name="mail" size={14} color="#6B7280" />
                      </View>
                      <Text style={styles.contactText}>{selectedApplication?.email}</Text>
                    </View>
                    <View style={styles.contactRow}>
                      <View style={styles.contactIcon}>
                        <Feather name="phone" size={14} color="#6B7280" />
                      </View>
                      <Text style={styles.contactText}>{selectedApplication?.phone}</Text>
                    </View>
                    <View style={styles.contactRow}>
                      <View style={styles.contactIcon}>
                        <Feather name="map-pin" size={14} color="#6B7280" />
                      </View>
                      <Text style={styles.contactText}>{selectedApplication?.location}</Text>
                    </View>
                  </View>
                </View>

                {/* Training & Experience */}
                <View style={styles.row}>
                  <View style={[styles.modalSection, styles.flex1]}>
                    <View style={styles.sectionHeader}>
                      <Feather name="award" size={16} color="#374151" />
                      <Text style={styles.sectionTitle}>Formación</Text>
                    </View>
                    <View style={styles.miniCard}>
                      <Text style={styles.infoText}>{selectedApplication?.education}</Text>
                    </View>
                  </View>
                  <View style={[styles.modalSection, styles.flex1]}>
                    <View style={styles.sectionHeader}>
                      <Feather name="clock" size={16} color="#374151" />
                      <Text style={styles.sectionTitle}>Experiencia</Text>
                    </View>
                    <View style={styles.miniCard}>
                      <Text style={styles.infoText}>{selectedApplication?.experience}</Text>
                    </View>
                  </View>
                </View>

                {/* Work History */}
                {selectedApplication.workHistory && selectedApplication.workHistory.length > 0 && (
                  <View style={styles.modalSection}>
                    <View style={styles.sectionHeader}>
                      <Feather name="briefcase" size={16} color="#374151" />
                      <Text style={styles.sectionTitle}>Historial Laboral</Text>
                    </View>
                    <View style={styles.workHistoryList}>
                      {selectedApplication.workHistory.map((job: any, idx: number) => (
                        <View key={idx} style={styles.workHistoryItem}>
                          <View style={styles.workHistoryHeader}>
                            <Text style={styles.jobTitle}>{job.position || job.cargo}</Text>
                            <Text style={styles.jobDates}>
                              {job.startDate || job.fechaInicio} — {job.isCurrent ? 'Actualidad' : job.endDate || job.fechaFin}
                            </Text>
                          </View>
                          <Text style={styles.jobCompany}>{job.company || job.empresa}</Text>
                          {job.description && (
                            <Text style={styles.jobDescription}>{job.description}</Text>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Skills */}
                <View style={styles.modalSection}>
                  <View style={styles.sectionHeader}>
                    <Feather name="zap" size={16} color="#374151" />
                    <Text style={styles.sectionTitle}>Habilidades</Text>
                  </View>
                  <View style={styles.skillsContainer}>
                    {selectedApplication.skills.map((skill) => (
                      <View key={skill} style={styles.skillChip}>
                        <Text style={styles.skillChipText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* CV Section */}
                {selectedApplication.cvFile && (
                  <View style={styles.modalSection}>
                    <View style={styles.sectionHeader}>
                      <Feather name="file-text" size={16} color="#374151" />
                      <Text style={styles.sectionTitle}>Documentación</Text>
                    </View>
                    <TouchableOpacity style={styles.cvDownloadCard} onPress={handleDownloadCV}>
                      <View style={styles.cvIconContainer}>
                        <Feather name="file-text" size={20} color="#F59E0B" />
                      </View>
                      <View style={styles.cvInfo}>
                        <Text style={styles.cvLabel}>Ver Hoja de Vida</Text>
                        <Text style={styles.cvSubtitle}>Formato PDF / Enlace Externo</Text>
                      </View>
                      <Feather name="external-link" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}

            {/* Terminal State Logic: Hide buttons if already decided */
             (selectedApplication?.status === 'accepted' || selectedApplication?.status === 'rejected') ? (
              <View style={[
                  styles.statusBanner, 
                  selectedApplication.status === 'accepted' ? styles.statusBannerAccepted : styles.statusBannerRejected
                ]}>
                <Feather 
                  name={selectedApplication.status === 'accepted' ? "check-circle" : "x-circle"} 
                  size={20} 
                  color={selectedApplication.status === 'accepted' ? "#059669" : "#DC2626"} 
                />
                <Text style={[
                  styles.statusBannerText,
                  selectedApplication.status === 'accepted' ? { color: "#059669" } : { color: "#DC2626" }
                ]}>
                  {selectedApplication.status === 'accepted' ? "Candidato Aceptado" : "Candidato Rechazado"}
                </Text>
              </View>
            ) : (
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.selectButton, isLoading && { opacity: 0.7 }]}
                    onPress={handleSelectCandidate}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.selectButtonText}>Aceptar Candidato</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.rejectButton, isLoading && { opacity: 0.7 }]}
                    onPress={handleReject}
                    disabled={isLoading}
                  >
                    <Text style={styles.rejectButtonText}>Rechazar</Text>
                  </TouchableOpacity>
                </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function StatBox({ label, value, color, isDesktop, light }: { label: string; value: number; color?: string; isDesktop: boolean; light?: boolean }) {
  return (
    <View style={[styles.statBox, !isDesktop && styles.statBoxMobile, light && styles.statBoxLight]}>
      <Text style={[styles.statNumber, color ? { color } : undefined, light && { color: '#FFF' }]}>{value}</Text>
      <Text style={[styles.statLabel, light && { color: 'rgba(255,255,255,0.8)' }]}>{label}</Text>
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
        {!!application.education && <Detail icon="award" text={application.education} />}
        {!!application.experience && <Detail icon="calendar" text={application.experience} />}
        {!!application.email && <Detail icon="mail" text={application.email} />}
        {!!application.phone && <Detail icon="phone" text={application.phone} />}
        {!!application.location && <Detail icon="map-pin" text={application.location} />}
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
    backgroundColor: "#F8FAFC",
  },
  fullScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
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
    overflow: 'hidden',
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
    flexWrap: "wrap",
  },
  statBox: {
    flex: 1,
    minWidth: 80,
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statBoxLight: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'transparent',
    borderWidth: 0,
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
  candidateProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  positionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  candidatePositionText: {
    fontSize: 13,
    color: '#D97706',
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5563',
  },
  infoGrid: {
    gap: 10,
  },
  contactIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  workHistoryList: {
    gap: 12,
  },
  workHistoryItem: {
    padding: 14,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  workHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  jobDates: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  jobCompany: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
    marginTop: 2,
  },
  jobDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginTop: 8,
  },
  cvDownloadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFBEB',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  cvIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cvInfo: {
    flex: 1,
  },
  cvLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  cvSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
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
    backgroundColor: "#F59E0B", // Orange instead of green
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
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  errorContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  statusBanner: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    borderWidth: 1,
  },
  statusBannerAccepted: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusBannerRejected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusBannerText: {
    fontSize: 15,
    fontWeight: '700',
  },
  selectionModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  selectionModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  selectionModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
    textAlign: "center",
  },
  selectionOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  selectionOptionText: {
    fontSize: 16,
    color: "#374151",
  },
  chipContainer: {
    marginTop: 12,
    gap: 12,
  },
  chipScroll: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
  },
  chipTextActive: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
});

function SelectionModal({
  visible,
  title,
  options,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: string[];
  onSelect: (option: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.selectionModalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.selectionModalContent}>
          <Text style={styles.selectionModalTitle}>{title}</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.selectionOption}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
              >
                <Text style={styles.selectionOptionText}>{option}</Text>
                <Feather name="chevron-right" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
