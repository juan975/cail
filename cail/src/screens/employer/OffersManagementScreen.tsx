import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useResponsiveLayout } from '@/hooks/useResponsive';
import { AutocompleteInput } from '@/components/ui/AutocompleteInput';
import { offersService } from '@/services/offers.service';
import { userService } from '@/services/user.service';
import { applicationsService } from '@/services/applications.service';
import { Offer, CreateOfferDTO, OfferStatus as ApiOfferStatus, HierarchyLevel } from '@/types/offers.types';
import { Application, ApplicationWithCandidate, ApplicationStatusColors } from '@/types/applications.types';

type OfferStatus = 'active' | 'paused' | 'closed';
type OfferAction = 'pause' | 'resume' | 'close' | 'delete';

interface JobOffer {
  id: string;
  title: string;
  department?: string;
  description: string;
  location: string;
  salary: string;
  modality: string;
  priority: string;
  publishedDate: string;
  status: OfferStatus;
  applications: number;
  views: number;
  requiredCompetencies: string[];
  requiredEducation: string[];
  requiredExperience: string;
  salaryMin?: number;
  salaryMax?: number;
  // Campos adicionales para sincronización con API
  apiId?: string;
  apiEstado?: ApiOfferStatus;
}

// Mapeo de estados API a estados UI
const mapApiStatusToUI = (estado: ApiOfferStatus): OfferStatus => {
  switch (estado) {
    case 'ACTIVA': return 'active';
    case 'PAUSADA': return 'paused';
    case 'CERRADA': return 'closed';
    default: return 'active';
  }
};

// Mapeo de estados UI a API
const mapUIStatusToApi = (status: OfferStatus): ApiOfferStatus => {
  switch (status) {
    case 'active': return 'ACTIVA';
    case 'paused': return 'PAUSADA';
    case 'closed': return 'CERRADA';
    default: return 'ACTIVA';
  }
};

// Convertir oferta de API a formato UI
const mapApiOfferToUI = (offer: Offer): JobOffer => {
  const fechaPub = offer.fechaPublicacion instanceof Date
    ? offer.fechaPublicacion
    : new Date(offer.fechaPublicacion);

  return {
    id: offer.idOferta,
    apiId: offer.idOferta,
    title: offer.titulo,
    description: offer.descripcion,
    location: offer.ciudad,
    salary: offer.salarioMin && offer.salarioMax
      ? `$${offer.salarioMin} - $${offer.salarioMax}`
      : offer.salarioMin
        ? `$${offer.salarioMin}+`
        : 'A convenir',
    modality: offer.modalidad,
    priority: 'Media',
    publishedDate: fechaPub.toLocaleDateString('es-EC'),
    status: mapApiStatusToUI(offer.estado),
    applications: 0,
    views: 0,
    requiredCompetencies: offer.competencias_requeridas || [],
    requiredEducation: offer.formacion_requerida ? [offer.formacion_requerida] : [],
    requiredExperience: offer.experiencia_requerida || '',
    salaryMin: offer.salarioMin,
    salaryMax: offer.salarioMax,
    apiEstado: offer.estado,
  };
};

export function OffersManagementScreen() {
  const { isDesktop, contentWidth, horizontalGutter } = useResponsiveLayout();
  const [selectedTab, setSelectedTab] = useState<OfferStatus>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null);
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [pendingAction, setPendingAction] = useState<{ type: OfferAction; offer: JobOffer } | null>(null);

  // Estados de carga y error
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para modal de aplicaciones
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [selectedOfferApplications, setSelectedOfferApplications] = useState<ApplicationWithCandidate[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [applicationsOffer, setApplicationsOffer] = useState<JobOffer | null>(null);

  // Profile State
  const [userCompany, setUserCompany] = useState('');

  // Selection Modal State
  const [selectionModalVisible, setSelectionModalVisible] = useState(false);
  const [selectionTitle, setSelectionTitle] = useState('');
  const [selectionOptions, setSelectionOptions] = useState<string[]>([]);
  const [onSelectOption, setOnSelectOption] = useState<((option: string) => void) | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [priority, setPriority] = useState('Media');
  const [salary, setSalary] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [modality, setModality] = useState('Presencial');
  const [location, setLocation] = useState('Loja');
  const [competencies, setCompetencies] = useState<string[]>([]);
  const [newCompetency, setNewCompetency] = useState('');
  const [education, setEducation] = useState<string[]>([]);
  const [newEducation, setNewEducation] = useState('');
  const [tipoContrato, setTipoContrato] = useState('Tiempo Completo');
  const [experiencia, setExperiencia] = useState('');
  const [hierarchyLevel, setHierarchyLevel] = useState<HierarchyLevel>('Junior');

  // Cargar ofertas del API
  const loadOffers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const apiOffers = await offersService.getMyOffers();
      const mappedOffers = apiOffers.map(mapApiOfferToUI);
      setOffers(mappedOffers);
    } catch (err: any) {
      console.error('Error loading offers:', err);
      setError(err.message || 'Error al cargar las ofertas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOffers();
    loadUserProfile();
  }, [loadOffers]);

  const loadUserProfile = async () => {
    try {
      const profile = await userService.getProfile();
      if (profile.employerProfile?.nombreEmpresa) {
        setUserCompany(profile.employerProfile.nombreEmpresa);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const filteredOffers = offers.filter((offer) => offer.status === selectedTab);
  const activeCount = offers.filter((o) => o.status === 'active').length;
  const pausedCount = offers.filter((o) => o.status === 'paused').length;
  const closedCount = offers.filter((o) => o.status === 'closed').length;
  const sectionTitles: Record<OfferStatus, string> = {
    active: 'Publicadas y Vigentes',
    paused: 'Ofertas en Pausa',
    closed: 'Ofertas Cerradas',
  };

  const openCreateModal = () => {
    resetForm();
    if (userCompany) {
      setDepartment(userCompany);
    }
    setShowCreateModal(true);
  };

  const openEditModal = (offer: JobOffer) => {
    setSelectedOffer(offer);
    setTitle(offer.title);
    setDescription(offer.description);
    setDepartment(offer.department || '');
    setSalary(offer.salary);
    setSalaryMin(offer.salaryMin?.toString() || '');
    setSalaryMax(offer.salaryMax?.toString() || '');
    setModality(offer.modality);
    setLocation(offer.location);
    setCompetencies(offer.requiredCompetencies);
    setEducation(offer.requiredEducation);
    setExperiencia(offer.requiredExperience);
    setHierarchyLevel((offer as any).hierarchyLevel || 'Junior');
    setShowEditModal(true);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDepartment(userCompany); // Reset to user company
    setPriority('Media');
    setSalary('');
    setSalaryMin('');
    setSalaryMax('');
    setModality('Presencial');
    setLocation('Loja');
    setCompetencies([]);
    setEducation([]);
    setNewCompetency('');
    setNewEducation('');
    setTipoContrato('Tiempo Completo');
    setExperiencia('');
    setHierarchyLevel('Junior');
  };

  const handleCreateOffer = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'El título y la descripción son obligatorios');
      return;
    }

    try {
      setIsSubmitting(true);

      const createData: CreateOfferDTO = {
        titulo: title,
        descripcion: description,
        empresa: department || 'Mi Empresa',
        ciudad: location,
        modalidad: modality,
        tipoContrato: tipoContrato,
        salarioMin: salaryMin ? parseInt(salaryMin) : undefined,
        salarioMax: salaryMax ? parseInt(salaryMax) : undefined,
        experiencia_requerida: experiencia,
        formacion_requerida: education.join(', '),
        competencias_requeridas: competencies,
        nivelJerarquico: hierarchyLevel,
      };

      const newOffer = await offersService.createOffer(createData);
      const uiOffer = mapApiOfferToUI(newOffer);

      setOffers([uiOffer, ...offers]);
      setShowCreateModal(false);
      resetForm();
      Alert.alert('Éxito', 'Oferta creada correctamente');
    } catch (err: any) {
      console.error('Error creating offer:', err);
      Alert.alert('Error', err.message || 'No se pudo crear la oferta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateOffer = async () => {
    if (!selectedOffer?.apiId) return;

    try {
      setIsSubmitting(true);

      const updateData = {
        titulo: title,
        descripcion: description,
        empresa: department,
        ciudad: location,
        modalidad: modality,
        tipoContrato: tipoContrato,
        experiencia_requerida: experiencia,
        formacion_requerida: education.join(', '),
        competencias_requeridas: competencies,
        salarioMin: salaryMin ? parseInt(salaryMin) : undefined,
        salarioMax: salaryMax ? parseInt(salaryMax) : undefined,
        nivelJerarquico: hierarchyLevel,
      };

      const updated = await offersService.updateOffer(selectedOffer.apiId, updateData);
      const uiOffer = mapApiOfferToUI(updated);

      setOffers(offers.map(o => o.id === selectedOffer.id ? uiOffer : o));
      setShowEditModal(false);
      setSelectedOffer(null);
      Alert.alert('Éxito', 'Oferta actualizada correctamente');
    } catch (err: any) {
      console.error('Error updating offer:', err);
      Alert.alert('Error', err.message || 'No se pudo actualizar la oferta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestOfferAction = (action: OfferAction, offer: JobOffer) => setPendingAction({ type: action, offer });
  const closeActionModal = () => setPendingAction(null);

  // Handler para ver aplicaciones de una oferta
  const handleViewApplications = async (offer: JobOffer) => {
    if (!offer.apiId) return;

    setApplicationsOffer(offer);
    setShowApplicationsModal(true);
    setLoadingApplications(true);

    try {
      const apps = await applicationsService.getOfferApplicationsWithCandidates(offer.apiId);
      setSelectedOfferApplications(apps);
    } catch (err: any) {
      console.error('Error loading applications:', err);
      Alert.alert('Error', 'No se pudieron cargar las aplicaciones');
      setSelectedOfferApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  };

  const closeApplicationsModal = () => {
    setShowApplicationsModal(false);
    setSelectedOfferApplications([]);
    setApplicationsOffer(null);
  };

  const handleActionConfirm = async () => {
    if (!pendingAction || !pendingAction.offer.apiId) return;

    const { type, offer } = pendingAction;

    try {
      setIsSubmitting(true);

      if (type === 'pause') {
        await offersService.pauseOffer(offer.apiId!);
        setOffers(prev => prev.map(item =>
          item.id === offer.id ? { ...item, status: 'paused', apiEstado: 'PAUSADA' } : item
        ));
      } else if (type === 'resume') {
        await offersService.activateOffer(offer.apiId!);
        setOffers(prev => prev.map(item =>
          item.id === offer.id ? { ...item, status: 'active', apiEstado: 'ACTIVA' } : item
        ));
      } else if (type === 'close') {
        await offersService.updateOffer(offer.apiId!, { estado: 'CERRADA' });
        setOffers(prev => prev.map(item =>
          item.id === offer.id ? { ...item, status: 'closed', apiEstado: 'CERRADA' } : item
        ));
      } else if (type === 'delete') {
        await offersService.deleteOffer(offer.apiId!);
        setOffers(prev => prev.filter(item => item.id !== offer.id));
      }

      setSelectedTab(type === 'pause' ? 'paused' : type === 'resume' ? 'active' : type === 'close' ? 'closed' : selectedTab);
      setPendingAction(null);
    } catch (err: any) {
      console.error('Error performing action:', err);
      Alert.alert('Error', err.message || 'No se pudo completar la acción');
    } finally {
      setIsSubmitting(false);
    }
  };

  const actionDetails = useMemo(() => {
    if (!pendingAction) return null;
    const { offer, type } = pendingAction;
    switch (type) {
      case 'pause':
        return {
          title: '¿Pausar esta oferta?',
          description: `La oferta "${offer.title}" dejará de ser visible para los candidatos.`,
          bullets: ['No recibirá nuevas postulaciones', 'Puedes reactivarla cuando desees', 'Las postulaciones actuales se conservan'],
          confirmColor: '#F59E0B',
        };
      case 'resume':
        return {
          title: '¿Reactivar esta oferta?',
          description: `La oferta "${offer.title}" volverá a estar activa y visible para postulaciones.`,
          confirmColor: '#10B981',
        };
      case 'close':
        return {
          title: '¿Cerrar esta oferta?',
          description: `La oferta "${offer.title}" se marcará como finalizada.`,
          bullets: ['No podrá recibir más candidatos', 'Se mantendrá el registro de aplicantes', 'Útil para puestos ya cubiertos'],
          confirmColor: '#EF4444',
        };
      default:
        return {
          title: '¿Eliminar esta oferta?',
          description: `La oferta "${offer.title}" será eliminada permanentemente.`,
          warning: 'Esta acción no se puede deshacer.',
          confirmColor: '#EF4444',
        };
    }
  }, [pendingAction]);

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={styles.loadingText}>Cargando ofertas...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Feather name="alert-circle" size={48} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadOffers}>
          <Feather name="refresh-cw" size={16} color="#fff" />
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.fullScroll}
        contentContainerStyle={[styles.scrollContent, { maxWidth: contentWidth, alignSelf: 'center' }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageStack}>
          <View style={[styles.surfaceCard, styles.block, { backgroundColor: '#F59E0B' }]}>
            <View style={styles.headerRow}>
              <View style={styles.headerIconContainer}>
                <Feather name="briefcase" size={24} color="#FFF" />
              </View>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.headerTitleMain}>Gestión de Ofertas</Text>
                <Text style={styles.headerSubtitleMain} numberOfLines={2}>
                  Define vacantes y administra su ciclo de vida
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.newOfferButtonMain} onPress={openCreateModal}>
              <Feather name="plus" size={18} color="#F59E0B" />
              <Text style={styles.newOfferTextMain}>Nueva Oferta de Trabajo</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.surfaceCard, styles.block, styles.tabsCard]}>
            <TabButton icon="check-circle" label={`Activas (${activeCount})`} active={selectedTab === 'active'} onPress={() => setSelectedTab('active')} />
            <TabButton icon="pause-circle" label={`Pausadas (${pausedCount})`} active={selectedTab === 'paused'} onPress={() => setSelectedTab('paused')} />
            <TabButton icon="x-circle" label={`Cerradas (${closedCount})`} active={selectedTab === 'closed'} onPress={() => setSelectedTab('closed')} />
          </View>

          <View style={styles.listCard}>
            {filteredOffers.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="inbox" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>No hay ofertas en esta categoría</Text>
              </View>
            ) : (
              filteredOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onEdit={() => openEditModal(offer)}
                  onViewApplications={() => handleViewApplications(offer)}
                  requestOfferAction={requestOfferAction}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modal Crear Oferta - Bottom Sheet Style */}
      {showCreateModal && (
        <Modal
          visible={showCreateModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowCreateModal(false)}
        >
          <View style={styles.bottomSheetOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.bottomSheetKeyboardView}
            >
              <View style={styles.bottomSheetContent}>
                <View style={styles.bottomSheetHeader}>
                  <View style={styles.bottomSheetTitleRow}>
                    <View style={styles.bottomSheetIconBox}>
                      <Feather name="briefcase" size={24} color="#F59E0B" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.bottomSheetEyebrow}>NUEVA OFERTA</Text>
                      <Text style={styles.bottomSheetTitle}>Ingresar Oferta Laboral</Text>
                      <Text style={styles.bottomSheetSubtitle}>Completa la descripción de la oferta y los perfiles requeridos</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setShowCreateModal(false)} style={styles.bottomSheetCloseBtn}>
                    <Feather name="x" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.bottomSheetScroll} showsVerticalScrollIndicator={false}>
                  <View style={styles.bottomSheetBody}>
                    <OfferForm
                      title={title}
                      description={description}
                      department={department}
                      salary={salary}
                      salaryMin={salaryMin}
                      salaryMax={salaryMax}
                      modality={modality}
                      location={location}
                      competencies={competencies}
                      education={education}
                      newCompetency={newCompetency}
                      newEducation={newEducation}
                      tipoContrato={tipoContrato}
                      experiencia={experiencia}
                      setTitle={setTitle}
                      setDescription={setDescription}
                      setDepartment={setDepartment}
                      setSalary={setSalary}
                      setSalaryMin={setSalaryMin}
                      setSalaryMax={setSalaryMax}
                      setModality={setModality}
                      setLocation={setLocation}
                      setNewCompetency={setNewCompetency}
                      setNewEducation={setNewEducation}
                      setTipoContrato={setTipoContrato}
                      setExperiencia={setExperiencia}
                      addCompetency={() => {
                        if (newCompetency.trim()) {
                          setCompetencies([...competencies, newCompetency.trim()]);
                          setNewCompetency('');
                        }
                      }}
                      addEducation={() => {
                        if (newEducation.trim()) {
                          setEducation([...education, newEducation.trim()]);
                          setNewEducation('');
                        }
                      }}
                      removeCompetency={(idx) => setCompetencies(competencies.filter((_, i) => i !== idx))}
                      removeEducation={(idx) => setEducation(education.filter((_, i) => i !== idx))}
                      onOpenSelection={(title, options, onSelect) => {
                        setSelectionTitle(title);
                        setSelectionOptions(options);
                        setOnSelectOption(() => onSelect);
                        setSelectionModalVisible(true);
                      }}
                      setCompetencies={setCompetencies}
                      setEducation={setEducation}
                      hierarchyLevel={hierarchyLevel}
                      setHierarchyLevel={setHierarchyLevel}
                    />
                  </View>
                </ScrollView>
                
                <View style={styles.bottomSheetFooter}>
                  <TouchableOpacity
                    style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
                    onPress={handleCreateOffer}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.submitText}>Publicar Oferta</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      )}


      {/* Modal Editar Oferta - Bottom Sheet Style */}
      {showEditModal && (
        <Modal
          visible={showEditModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowEditModal(false)}
        >
          <View style={styles.bottomSheetOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.bottomSheetKeyboardView}
            >
              <View style={styles.bottomSheetContent}>
                <View style={styles.bottomSheetHeader}>
                  <View style={styles.bottomSheetTitleRow}>
                    <View style={styles.bottomSheetIconBox}>
                      <Feather name="edit-2" size={24} color="#F59E0B" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.bottomSheetEyebrow}>EDITAR OFERTA</Text>
                      <Text style={styles.bottomSheetTitle} numberOfLines={1}>Actualizar Detalles</Text>
                      <Text style={styles.bottomSheetSubtitle} numberOfLines={1}>Modifica los requisitos o descripción de "{selectedOffer?.title}"</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setShowEditModal(false)} style={styles.bottomSheetCloseBtn}>
                    <Feather name="x" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.bottomSheetScroll} showsVerticalScrollIndicator={false}>
                  <View style={styles.bottomSheetBody}>
                    <OfferForm
                      title={title}
                      description={description}
                      department={department}
                      salary={salary}
                      salaryMin={salaryMin}
                      salaryMax={salaryMax}
                      modality={modality}
                      location={location}
                      competencies={competencies}
                      education={education}
                      newCompetency={newCompetency}
                      newEducation={newEducation}
                      tipoContrato={tipoContrato}
                      experiencia={experiencia}
                      setTitle={setTitle}
                      setDescription={setDescription}
                      setDepartment={setDepartment}
                      setSalary={setSalary}
                      setSalaryMin={setSalaryMin}
                      setSalaryMax={setSalaryMax}
                      setModality={setModality}
                      setLocation={setLocation}
                      setNewCompetency={setNewCompetency}
                      setNewEducation={setNewEducation}
                      setTipoContrato={setTipoContrato}
                      setExperiencia={setExperiencia}
                      addCompetency={() => {
                        if (newCompetency.trim()) {
                          setCompetencies([...competencies, newCompetency.trim()]);
                          setNewCompetency('');
                        }
                      }}
                      addEducation={() => {
                        if (newEducation.trim()) {
                          setEducation([...education, newEducation.trim()]);
                          setNewEducation('');
                        }
                      }}
                      removeCompetency={(idx) => setCompetencies(competencies.filter((_, i) => i !== idx))}
                      removeEducation={(idx) => setEducation(education.filter((_, i) => i !== idx))}
                      onOpenSelection={(title, options, onSelect) => {
                        setSelectionTitle(title);
                        setSelectionOptions(options);
                        setOnSelectOption(() => onSelect);
                        setSelectionModalVisible(true);
                      }}
                      setCompetencies={setCompetencies}
                      setEducation={setEducation}
                      hierarchyLevel={hierarchyLevel}
                      setHierarchyLevel={setHierarchyLevel}
                    />
                  </View>
                </ScrollView>

                <View style={styles.bottomSheetFooter}>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity 
                      style={[styles.cancelButton, { flex: 1, height: 50, justifyContent: 'center' }]} 
                      onPress={() => setShowEditModal(false)}
                    >
                      <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.submitButton, isSubmitting && styles.buttonDisabled, { flex: 2, height: 50 }]}
                      onPress={handleUpdateOffer}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.submitText}>Guardar Cambios</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      )}

      {/* Modal Confirmar Acción */}
      <Modal visible={!!pendingAction} animationType="fade" transparent onRequestClose={closeActionModal}>
        <View style={styles.dialogOverlay}>
          <View style={[styles.surfaceCard]}>
            {actionDetails && (
              <>
                <Text style={styles.dialogTitle}>{actionDetails.title}</Text>
                <Text style={styles.dialogDescription}>{actionDetails.description}</Text>
                {actionDetails.bullets && (
                  <View style={styles.dialogBullets}>
                    {actionDetails.bullets.map((b) => (
                      <View key={b} style={styles.dialogBulletRow}>
                        <View style={styles.dialogDot} />
                        <Text style={styles.dialogBulletText}>{b}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {actionDetails.warning && (
                  <View style={styles.dialogWarning}>
                    <Feather name="alert-triangle" size={16} color="#DC2626" />
                    <Text style={styles.dialogWarningText}>{actionDetails.warning}</Text>
                  </View>
                )}
                <View style={styles.dialogActions}>
                  <TouchableOpacity style={styles.dialogCancel} onPress={closeActionModal}>
                    <Text style={styles.dialogCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dialogConfirm, { backgroundColor: actionDetails.confirmColor }, isSubmitting && styles.buttonDisabled]}
                    onPress={handleActionConfirm}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.dialogConfirmText}>Confirmar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal Ver Aplicaciones */}
      <Modal visible={showApplicationsModal} animationType="slide" transparent onRequestClose={closeApplicationsModal}>
        <View style={[styles.modalOverlay, isDesktop ? styles.modalOverlayDesktop : styles.modalOverlayMobile]}>
          <View
            style={[
              styles.modalContent,
              isDesktop ? styles.modalContentDesktop : styles.modalContentMobile,
              { maxWidth: isDesktop ? 600 : contentWidth },
            ]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Aplicaciones Recibidas</Text>
                <Text style={styles.modalSubtitle}>{applicationsOffer?.title}</Text>
              </View>
              <TouchableOpacity onPress={closeApplicationsModal}>
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {loadingApplications ? (
              <View style={styles.applicationsLoading}>
                <ActivityIndicator size="large" color="#F59E0B" />
                <Text style={styles.loadingText}>Cargando aplicaciones...</Text>
              </View>
            ) : selectedOfferApplications.length === 0 ? (
              <View style={styles.applicationsEmpty}>
                <Feather name="inbox" size={48} color="#D1D5DB" />
                <Text style={styles.applicationsEmptyText}>No hay aplicaciones para esta oferta</Text>
                <Text style={styles.applicationsEmptySubtext}>Los candidatos aún no han aplicado</Text>
              </View>
            ) : (
              <FlatList
                data={selectedOfferApplications}
                keyExtractor={(item) => item.idAplicacion}
                style={styles.applicationsList}
                renderItem={({ item }) => {
                  const statusInfo = ApplicationStatusColors[item.estado];
                  const candidateName = item.candidato?.nombreCompleto || 'Candidato sin nombre';
                  const candidateEmail = item.candidato?.email || 'Email no disponible';
                  const candidateEdu = item.candidato?.nivelEducativo || 'Nivel no especificado';
                  
                  const rawDate = item.fechaAplicacion;
                  let fechaApp: Date;
                  if (rawDate instanceof Date) {
                    fechaApp = rawDate;
                  } else if (typeof rawDate === 'string' && rawDate) {
                    fechaApp = new Date(rawDate);
                  } else {
                    fechaApp = new Date();
                  }
                  const isValidDate = !isNaN(fechaApp.getTime());

                  return (
                    <View style={styles.applicationItem}>
                      <View style={styles.applicationItemHeader}>
                        <View style={styles.applicationItemInfo}>
                          <Text style={styles.applicationItemId}>{candidateName}</Text>
                          <Text style={styles.applicationItemDate}>{candidateEmail}</Text>
                          <Text style={[styles.applicationItemDate, { color: '#F59E0B', fontWeight: '600', marginTop: 2 }]}>
                            {candidateEdu}
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 6 }}>
                          <View style={[styles.applicationItemBadge, { backgroundColor: statusInfo.bg }]}>
                            <Text style={[styles.applicationItemBadgeText, { color: statusInfo.text }]}>
                              {statusInfo.label}
                            </Text>
                          </View>
                          {item.matchScore !== undefined && (
                            <View style={styles.matchScoreBadgeSmall}>
                              <Text style={styles.matchScoreTextSmall}>{item.matchScore}% Match</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      
                      <View style={styles.applicationItemFooter}>
                         <View style={{ flex: 1 }}>
                           <Text style={styles.applicationItemDate}>
                              Aplicado: {isValidDate ? fechaApp.toLocaleDateString('es-EC') : 'Fecha no disponible'}
                            </Text>
                         </View>
                         
                         {item.candidato?.cvUrl && (
                           <TouchableOpacity 
                             style={styles.cvDownloadBtnInline} 
                             onPress={() => Linking.openURL(item.candidato!.cvUrl!)}
                           >
                             <Feather name="file-text" size={14} color="#F59E0B" />
                             <Text style={styles.cvDownloadBtnText}>Ver CV</Text>
                           </TouchableOpacity>
                         )}
                      </View>
                    </View>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Selection Modal */}
      <Modal
        visible={selectionModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectionModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.selectionModalOverlay}
          activeOpacity={1}
          onPress={() => setSelectionModalVisible(false)}
        >
          <View style={styles.selectionModalContent}>
            <Text style={styles.selectionModalTitle}>{selectionTitle}</Text>
            <FlatList
              data={selectionOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.selectionOption}
                  onPress={() => {
                    if (onSelectOption) {
                      onSelectOption(item);
                    }
                    setSelectionModalVisible(false);
                  }}
                >
                  <Text style={styles.selectionOptionText}>{item}</Text>
                  <Feather name="chevron-right" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function TabButton({ icon, label, active, onPress }: { icon: keyof typeof Feather.glyphMap; label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.tab, active && styles.tabActive]} onPress={onPress}>
      <Feather name={icon} size={16} color={active ? '#4B5BE8' : '#6B7280'} style={{ marginRight: 6 }} />
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function OfferCard({
  offer,
  onEdit,
  onViewApplications,
  requestOfferAction,
}: {
  offer: JobOffer;
  onEdit: () => void;
  onViewApplications: () => void;
  requestOfferAction: (action: OfferAction, offer: JobOffer) => void;
}) {
  return (
    <View style={styles.offerCard}>
      <View style={styles.offerHeader}>
        <Text style={styles.offerTitle}>{offer.title}</Text>
        <TouchableOpacity onPress={onEdit} style={styles.headerEditBtn}>
          <Feather name="edit-2" size={18} color="#10B981" />
        </TouchableOpacity>
      </View>
      <Text style={styles.offerDescription} numberOfLines={2}>
        {offer.description}
      </Text>
      <View style={styles.offerMeta}>
        <Detail icon="map-pin" text={offer.location} />
        <Detail icon="dollar-sign" text={offer.salary} />
        <Detail icon="home" text={offer.modality} />
        <Detail icon="calendar" text={`Publicado: ${offer.publishedDate}`} />
      </View>
      <View style={styles.offerActions}>
        {offer.status === 'active' && (
          <>
            <TouchableOpacity style={styles.infoGhost} onPress={onViewApplications}>
              <Feather name="users" size={16} color="#3B82F6" />
              <Text style={[styles.actionText, { color: '#3B82F6' }]}>Candidatos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.warningGhost} onPress={() => requestOfferAction('pause', offer)}>
              <Feather name="pause" size={16} color="#F59E0B" />
              <Text style={[styles.actionText, { color: '#F59E0B' }]}>Pausar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dangerGhost} onPress={() => requestOfferAction('close', offer)}>
              <Feather name="x-circle" size={16} color="#EF4444" />
              <Text style={[styles.actionText, { color: '#EF4444' }]}>Cerrar</Text>
            </TouchableOpacity>
          </>
        )}
        {offer.status === 'paused' && (
          <>
            <TouchableOpacity style={styles.infoGhost} onPress={onViewApplications}>
              <Feather name="users" size={16} color="#3B82F6" />
              <Text style={[styles.actionText, { color: '#3B82F6' }]}>Candidatos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryGhost} onPress={() => requestOfferAction('resume', offer)}>
              <Feather name="play" size={16} color="#10B981" />
              <Text style={[styles.actionText, { color: '#10B981' }]}>Reactivar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dangerGhost} onPress={() => requestOfferAction('close', offer)}>
              <Feather name="x-circle" size={16} color="#EF4444" />
              <Text style={[styles.actionText, { color: '#EF4444' }]}>Cerrar</Text>
            </TouchableOpacity>
          </>
        )}
        {offer.status === 'closed' && (
          <View style={styles.deletedTag}>
            <Feather name="lock" size={16} color="#6B7280" />
            <Text style={[styles.deletedTagText, { color: '#6B7280' }]}>Oferta Cerrada</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function Detail({ icon, text }: { icon: keyof typeof Feather.glyphMap; text: string }) {
  return (
    <View style={styles.detailRow}>
      <Feather name={icon} size={14} color="#6B7280" />
      <Text style={styles.detailText}>{text}</Text>
    </View>
  );
}

function OfferForm({
  title,
  description,
  department,
  salary,
  salaryMin,
  salaryMax,
  modality,
  location,
  competencies,
  education,
  newCompetency,
  newEducation,
  tipoContrato,
  experiencia,
  setTitle,
  setDescription,
  setDepartment,
  setSalary,
  setSalaryMin,
  setSalaryMax,
  setModality,
  setLocation,
  setNewCompetency,
  setNewEducation,
  setTipoContrato,
  setExperiencia,
  addCompetency,
  addEducation,
  removeCompetency,
  removeEducation,
  onOpenSelection,
  setCompetencies,
  setEducation,
  hierarchyLevel,
  setHierarchyLevel,
}: {
  title: string;
  description: string;
  department: string;
  salary: string;
  salaryMin: string;
  salaryMax: string;
  modality: string;
  location: string;
  competencies: string[];
  education: string[];
  newCompetency: string;
  newEducation: string;
  tipoContrato: string;
  experiencia: string;
  setTitle: (v: string) => void;
  setDescription: (v: string) => void;
  setDepartment: (v: string) => void;
  setSalary: (v: string) => void;
  setSalaryMin: (v: string) => void;
  setSalaryMax: (v: string) => void;
  setModality: (v: string) => void;
  setLocation: (v: string) => void;
  setNewCompetency: (v: string) => void;
  setNewEducation: (v: string) => void;
  setTipoContrato: (v: string) => void;
  setExperiencia: (v: string) => void;
  addCompetency: () => void;
  addEducation: () => void;
  removeCompetency: (index: number) => void;
  removeEducation: (index: number) => void;
  onOpenSelection: (title: string, options: string[], onSelect: (option: string) => void) => void;
  setCompetencies: (items: string[]) => void;
  setEducation: (items: string[]) => void;
  hierarchyLevel: HierarchyLevel;
  setHierarchyLevel: (v: HierarchyLevel) => void;
}) {
  const MODALITY_OPTIONS = ['Presencial', 'Híbrido', 'Remoto'];
  const CONTRACT_OPTIONS = ['Tiempo Completo', 'Medio Tiempo', 'Por Horas', 'Temporal', 'Freelance', 'Pasantía'];
  const HIERARCHY_OPTIONS: HierarchyLevel[] = ['Junior', 'Semi-Senior', 'Senior', 'Gerencial'];

  // Reuse Web lists
  const COMMON_COMPETENCIES = [
    'JavaScript', 'TypeScript', 'React', 'React Native', 'Angular', 'Vue.js', 'Node.js',
    'Python', 'Java', 'C#', 'C++', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Firebase', 'Redis', 'GraphQL',
    'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes', 'CI/CD', 'DevOps',
    'Git', 'GitHub', 'GitLab', 'Jira', 'Agile', 'Scrum', 'Kanban',
    'HTML', 'CSS', 'SASS', 'Tailwind CSS', 'Bootstrap', 'Material UI',
    'REST API', 'Microservicios', 'Arquitectura de Software',
    'Machine Learning', 'Inteligencia Artificial', 'Data Science', 'Big Data',
    'Seguridad Informática', 'Pentesting', 'Ciberseguridad',
    'Comunicación', 'Trabajo en Equipo', 'Liderazgo', 'Resolución de Problemas',
    'Gestión de Proyectos', 'Negociación', 'Presentaciones', 'Ventas',
    'Inglés', 'Español', 'Portugués', 'Francés', 'Alemán',
    'Excel', 'Power BI', 'Tableau', 'SAP', 'ERP', 'CRM', 'Salesforce',
    'Marketing Digital', 'SEO', 'SEM', 'Google Analytics', 'Redes Sociales',
    'Diseño Gráfico', 'UI/UX', 'Figma', 'Adobe Photoshop', 'Adobe Illustrator',
    'Contabilidad', 'Finanzas', 'Recursos Humanos', 'Administración de Empresas',
    'Atención al Cliente', 'Soporte Técnico', 'Help Desk',
  ];

  const COMMON_EDUCATION = [
    'Ingeniería en Sistemas', 'Ingeniería de Software', 'Ingeniería Informática',
    'Licenciatura en Ciencias de la Computación', 'Tecnólogo en Desarrollo de Software',
    'Administración de Empresas', 'Contabilidad y Auditoría', 'Economía',
    'Ingeniería Comercial', 'Marketing', 'Diseño Gráfico',
    'Comunicación Social', 'Derecho', 'Psicología',
    'Ingeniería Industrial', 'Ingeniería Civil', 'Arquitectura',
    'Medicina', 'Enfermería', 'Educación',
  ];
  return (
    <ScrollView
      style={styles.modalForm}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Ej: Ingeniero de Sistemas"
          placeholderTextColor="#9CA3AF"
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Departamento</Text>
        <TextInput
          style={styles.input}
          value={department}
          onChangeText={setDepartment}
          placeholder="Ej: Tecnología, RRHH..."
          placeholderTextColor="#9CA3AF"
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe las responsabilidades, funciones y requisitos del puesto..."
          multiline
          numberOfLines={4}
          placeholderTextColor="#9CA3AF"
        />
      </View>
      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>Salario Mínimo</Text>
          <TextInput
            style={styles.input}
            value={salaryMin}
            onChangeText={setSalaryMin}
            placeholder="1000"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>Salario Máximo</Text>
          <TextInput
            style={styles.input}
            value={salaryMax}
            onChangeText={setSalaryMax}
            placeholder="1500"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
        </View>
      </View>
      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>Modalidad</Text>
          <TouchableOpacity
            style={styles.selectContainer}
            onPress={() => onOpenSelection('Selecciona Modalidad', MODALITY_OPTIONS, setModality)}
          >
            <Text style={styles.selectText}>{modality}</Text>
            <Feather name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>Ubicación</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Loja"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>
      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>Tipo de Contrato</Text>
          <TouchableOpacity
            style={styles.selectContainer}
            onPress={() => onOpenSelection('Tipo de Contrato', CONTRACT_OPTIONS, setTipoContrato)}
          >
            <Text style={styles.selectText}>{tipoContrato}</Text>
            <Feather name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Experiencia Requerida</Text>
        <TextInput
          style={styles.input}
          value={experiencia}
          onChangeText={setExperiencia}
          placeholder="Ej: 2-3 años en desarrollo backend"
          placeholderTextColor="#9CA3AF"
        />
      </View>
      <View style={[styles.inputGroup, styles.flex1]}>
        <Text style={styles.label}>Nivel Jerárquico</Text>
        <TouchableOpacity
          style={styles.selectContainer}
          onPress={() => onOpenSelection('Nivel Jerárquico', HIERARCHY_OPTIONS, (val) => setHierarchyLevel(val as HierarchyLevel))}
        >
          <Text style={styles.selectText}>{hierarchyLevel}</Text>
          <Feather name="chevron-down" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>Perfiles Requeridos</Text>
      <View style={styles.inputGroup}>
        <AutocompleteInput
          label="Competencias Requeridas"
          placeholder="Ej: Trabajo en equipo, Liderazgo..."
          selectedItems={competencies}
          suggestions={COMMON_COMPETENCIES}
          onChange={setCompetencies}
          maxItems={10}
          chipColor="#3B82F6"
        />
      </View>

      <View style={[styles.inputGroup, { zIndex: 10 }]}>
        <AutocompleteInput
          label="Formación Requerida"
          placeholder="Ej: Ingeniería en Sistemas..."
          selectedItems={education}
          suggestions={COMMON_EDUCATION}
          onChange={setEducation}
          maxItems={5}
          chipColor="#8B5CF6"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  fullScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 32,
    width: '100%',
  },
  pageStack: {
    width: '100%',
    gap: 16,
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
  block: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
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
  newOfferButtonMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  newOfferTextMain: {
    color: '#F59E0B',
    fontWeight: '800',
    fontSize: 15,
  },
  tabsCard: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    paddingVertical: 12,
  },
  tab: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 140,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#EEF2FF',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#1F2937',
    fontWeight: '700',
  },
  listCard: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
    textAlign: 'center',
  },
  offerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  headerEditBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
  },
  offerDepartment: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  offerDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  offerMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
  },
  offerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryGhost: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
  },
  warningGhost: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
  },
  dangerGhost: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  infoGhost: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#DBEAFE',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  deletedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  deletedTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B91C1C',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Light translucent white instead of gray
  },
  modalOverlayDesktop: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  modalOverlayMobile: {
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    width: '100%',
  },
  modalContentDesktop: {
    borderRadius: 20,
    maxHeight: '90%',
  },
  modalContentMobile: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  modalForm: {
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  selectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  selectText: {
    fontSize: 15,
    color: '#1F2937',
  },
  addInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 0,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  cancelText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F59E0B',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  dialogDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  dialogBullets: {
    marginBottom: 12,
  },
  dialogBulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  dialogDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6B7280',
  },
  dialogBulletText: {
    fontSize: 13,
    color: '#6B7280',
  },
  dialogWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  dialogWarningText: {
    fontSize: 13,
    color: '#DC2626',
    flex: 1,
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 12,
  },
  dialogCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  dialogCancelText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '600',
  },
  dialogConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  dialogConfirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  // Applications Modal Styles
  applicationsLoading: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applicationsEmpty: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applicationsEmptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  applicationsEmptySubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  applicationsList: {
    maxHeight: 400,
    padding: 16,
  },
  applicationItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  readonlyInput: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    color: '#6B7280',
  },
  selectionModalContent: {
    width: '80%',
    maxHeight: '60%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  selectionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  selectionModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  selectionOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  selectionOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  applicationItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  applicationItemInfo: {
    flex: 1,
  },
  applicationItemId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  applicationItemDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  applicationItemBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  applicationItemBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  applicationItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  applicationItemScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  applicationItemScoreLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  applicationItemScoreValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  // Bottom Sheet Modal Styles
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetKeyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSheetContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '95%',
    width: '100%',
    overflow: 'hidden',
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  bottomSheetTitleRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    flex: 1,
  },
  bottomSheetIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheetEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  bottomSheetSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  bottomSheetCloseBtn: {
    padding: 4,
  },
  bottomSheetScroll: {
    maxHeight: '100%',
  },
  bottomSheetFooter: {
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  bottomSheetBody: {
    padding: 20,
    gap: 20,
  },
  matchScoreBadgeSmall: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  matchScoreTextSmall: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
  },
  cvDownloadBtnInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  cvDownloadBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
  },
});
