import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useResponsiveLayout } from '@/hooks/useResponsive';
import { offersService } from '@/services/offers.service';
import { Offer, CreateOfferDTO, OfferStatus as ApiOfferStatus } from '@/types/offers.types';

type OfferStatus = 'active' | 'archived' | 'deleted';
type OfferAction = 'archive' | 'restore' | 'delete';

interface JobOffer {
  id: string;
  title: string;
  department: string;
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
  // Campos adicionales para sincronización con API
  apiId?: string;
  apiEstado?: ApiOfferStatus;
}

// Mapeo de estados API a estados UI
const mapApiStatusToUI = (estado: ApiOfferStatus): OfferStatus => {
  switch (estado) {
    case 'ACTIVA': return 'active';
    case 'PAUSADA':
    case 'CERRADA': return 'archived';
    default: return 'active';
  }
};

// Mapeo de estados UI a API
const mapUIStatusToApi = (status: OfferStatus): ApiOfferStatus => {
  switch (status) {
    case 'active': return 'ACTIVA';
    case 'archived': return 'PAUSADA';
    case 'deleted': return 'CERRADA';
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
    department: offer.empresa,
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
  }, [loadOffers]);

  const filteredOffers = offers.filter((offer) => offer.status === selectedTab);
  const activeCount = offers.filter((o) => o.status === 'active').length;
  const archivedCount = offers.filter((o) => o.status === 'archived').length;
  const deletedCount = offers.filter((o) => o.status === 'deleted').length;
  const sectionTitles: Record<OfferStatus, string> = {
    active: 'Publicadas y Vigentes',
    archived: 'Historial de Ofertas Archivadas',
    deleted: 'Historial de Ofertas Retiradas',
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (offer: JobOffer) => {
    setSelectedOffer(offer);
    setTitle(offer.title);
    setDescription(offer.description);
    setDepartment(offer.department);
    setSalary(offer.salary);
    setModality(offer.modality);
    setLocation(offer.location);
    setCompetencies(offer.requiredCompetencies);
    setEducation(offer.requiredEducation);
    setExperiencia(offer.requiredExperience);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDepartment('');
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

  const handleActionConfirm = async () => {
    if (!pendingAction || !pendingAction.offer.apiId) return;

    const { type, offer } = pendingAction;

    try {
      setIsSubmitting(true);

      if (type === 'archive') {
        await offersService.pauseOffer(offer.apiId);
        setOffers(prev => prev.map(item =>
          item.id === offer.id ? { ...item, status: 'archived' as OfferStatus, apiEstado: 'PAUSADA' } : item
        ));
      } else if (type === 'restore') {
        await offersService.activateOffer(offer.apiId);
        setOffers(prev => prev.map(item =>
          item.id === offer.id ? { ...item, status: 'active' as OfferStatus, apiEstado: 'ACTIVA' } : item
        ));
      } else if (type === 'delete') {
        await offersService.deleteOffer(offer.apiId);
        setOffers(prev => prev.filter(item => item.id !== offer.id));
      }

      setSelectedTab(type === 'archive' ? 'archived' : type === 'restore' ? 'active' : selectedTab);
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
      case 'archive':
        return {
          title: '¿Archivar esta oferta?',
          description: `La oferta "${offer.title}" será movida al historial de ofertas archivadas.`,
          bullets: ['No será visible para los candidatos', 'Podrás restaurarla cuando desees', 'Las postulaciones existentes se conservan'],
          confirmColor: '#F59E0B',
        };
      case 'restore':
        return {
          title: '¿Restaurar esta oferta?',
          description: `La oferta "${offer.title}" será restaurada y estará activa nuevamente para recibir postulaciones.`,
          confirmColor: '#10B981',
        };
      default:
        return {
          title: '¿Retirar esta oferta permanentemente?',
          description: `La oferta "${offer.title}" será eliminada permanentemente del sistema.`,
          warning: 'Esta acción no se puede deshacer. La oferta y sus estadísticas serán eliminadas.',
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
    <View style={[styles.container, { paddingHorizontal: horizontalGutter }]}>
      <ScrollView
        style={styles.fullScroll}
        contentContainerStyle={[styles.scrollContent, { maxWidth: contentWidth, alignSelf: 'center' }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageStack}>
          <View style={[styles.surfaceCard, styles.block]}>
            <View style={styles.headerContent}>
              <View style={styles.iconBadge}>
                <Feather name="briefcase" size={20} color="#F59E0B" />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Gestión de Ofertas Laborales</Text>
                <Text style={styles.headerSubtitle}>Define vacantes y administra su ciclo de vida</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.newOfferButton} onPress={openCreateModal}>
              <Feather name="plus" size={18} color="#fff" />
              <Text style={styles.newOfferText}>Nueva Oferta</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.surfaceCard, styles.block, styles.tabsCard]}>
            <TabButton label={`Activas (${activeCount})`} active={selectedTab === 'active'} onPress={() => setSelectedTab('active')} />
            <TabButton label={`Archivadas (${archivedCount})`} active={selectedTab === 'archived'} onPress={() => setSelectedTab('archived')} />
            <TabButton label={`Borradas (${deletedCount})`} active={selectedTab === 'deleted'} onPress={() => setSelectedTab('deleted')} />
          </View>

          <View style={[styles.surfaceCard, styles.block, styles.listCard]}>
            <Text style={styles.sectionLabel}>{sectionTitles[selectedTab]}</Text>
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
                  onArchive={() => requestOfferAction('archive', offer)}
                  onRestore={() => requestOfferAction('restore', offer)}
                  onDelete={() => requestOfferAction('delete', offer)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modal Crear Oferta */}
      <Modal visible={showCreateModal} animationType="slide" transparent onRequestClose={() => setShowCreateModal(false)}>
        <View style={[styles.modalOverlay, isDesktop ? styles.modalOverlayDesktop : styles.modalOverlayMobile]}>
          <View
            style={[
              styles.modalContent,
              isDesktop ? styles.modalContentDesktop : styles.modalContentMobile,
              { maxWidth: isDesktop ? 980 : contentWidth },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ingresar Oferta Laboral</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Completa la descripción de la oferta y los perfiles requeridos</Text>
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
            />
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
      </Modal>

      {/* Modal Editar Oferta */}
      <Modal visible={showEditModal} animationType="slide" transparent onRequestClose={() => setShowEditModal(false)}>
        <View style={[styles.modalOverlay, isDesktop ? styles.modalOverlayDesktop : styles.modalOverlayMobile]}>
          <View
            style={[
              styles.modalContent,
              isDesktop ? styles.modalContentDesktop : styles.modalContentMobile,
              { maxWidth: isDesktop ? 980 : contentWidth },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Actualizar Oferta</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Edita los detalles de la oferta "{selectedOffer?.title}"</Text>
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
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEditModal(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, isSubmitting && styles.buttonDisabled]}
                onPress={handleUpdateOffer}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveText}>Guardar Cambios</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    </View>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.tab, active && styles.tabActive]} onPress={onPress}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function OfferCard({
  offer,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: {
  offer: JobOffer;
  onEdit: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.offerCard}>
      <View style={styles.offerHeader}>
        <Text style={styles.offerTitle}>{offer.title}</Text>
        <View style={styles.badges}>
          <View style={styles.statusBadge}>
            <Text style={[styles.statusBadgeText, offer.status === 'active' ? styles.statusActive : styles.statusMuted]}>
              {offer.status === 'active' ? 'Activa' : offer.status === 'archived' ? 'Archivada' : 'Borrada'}
            </Text>
          </View>
          <View style={styles.priorityBadge}>
            <Text style={styles.priorityText}>{offer.priority}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.offerDepartment}>{offer.department}</Text>
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
            <TouchableOpacity style={styles.primaryGhost} onPress={onEdit}>
              <Feather name="edit-2" size={16} color="#10B981" />
              <Text style={[styles.actionText, { color: '#10B981' }]}>Actualizar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.warningGhost} onPress={onArchive}>
              <Feather name="archive" size={16} color="#F59E0B" />
              <Text style={[styles.actionText, { color: '#F59E0B' }]}>Archivar</Text>
            </TouchableOpacity>
          </>
        )}
        {offer.status === 'archived' && (
          <>
            <TouchableOpacity style={styles.primaryGhost} onPress={onRestore}>
              <Feather name="rotate-ccw" size={16} color="#10B981" />
              <Text style={[styles.actionText, { color: '#10B981' }]}>Restaurar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dangerGhost} onPress={onDelete}>
              <Feather name="trash-2" size={16} color="#DC2626" />
              <Text style={[styles.actionText, { color: '#DC2626' }]}>Eliminar</Text>
            </TouchableOpacity>
          </>
        )}
        {offer.status === 'deleted' && (
          <View style={styles.deletedTag}>
            <Feather name="trash-2" size={16} color="#B91C1C" />
            <Text style={styles.deletedTagText}>Oferta retirada</Text>
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
}) {
  return (
    <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Título del Puesto *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Ej: Ingeniero de Sistemas"
          placeholderTextColor="#9CA3AF"
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Descripción de la Oferta *</Text>
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
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Empresa / Departamento</Text>
        <TextInput
          style={styles.input}
          value={department}
          onChangeText={setDepartment}
          placeholder="Ej: Mi Empresa S.A."
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
          <View style={styles.selectContainer}>
            <Text style={styles.selectText}>{modality}</Text>
            <Feather name="chevron-down" size={20} color="#6B7280" />
          </View>
        </View>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>Tipo de Contrato</Text>
          <View style={styles.selectContainer}>
            <Text style={styles.selectText}>{tipoContrato}</Text>
            <Feather name="chevron-down" size={20} color="#6B7280" />
          </View>
        </View>
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ubicación</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Loja"
          placeholderTextColor="#9CA3AF"
        />
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

      <Text style={styles.sectionTitle}>Perfiles Requeridos</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Competencias Requeridas</Text>
        <View style={styles.addInputRow}>
          <TextInput
            style={[styles.input, styles.flex1]}
            value={newCompetency}
            onChangeText={setNewCompetency}
            placeholder="Ej: Trabajo en equipo, Liderazgo..."
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity style={styles.addButton} onPress={addCompetency}>
            <Feather name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.chipContainer}>
          {competencies.map((comp, index) => (
            <View key={comp + index} style={styles.chip}>
              <Text style={styles.chipText}>{comp}</Text>
              <TouchableOpacity onPress={() => removeCompetency(index)}>
                <Feather name="x" size={14} color="#6B7280" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Formación Requerida</Text>
        <View style={styles.addInputRow}>
          <TextInput
            style={[styles.input, styles.flex1]}
            value={newEducation}
            onChangeText={setNewEducation}
            placeholder="Ej: Ingeniería en Sistemas, Licenciatura en Administración..."
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity style={styles.addButton} onPress={addEducation}>
            <Feather name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.chipContainer}>
          {education.map((edu, index) => (
            <View key={edu + index} style={styles.chip}>
              <Text style={styles.chipText}>{edu}</Text>
              <TouchableOpacity onPress={() => removeEducation(index)}>
                <Feather name="x" size={14} color="#6B7280" />
              </TouchableOpacity>
            </View>
          ))}
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  newOfferButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 12,
  },
  newOfferText: {
    color: '#fff',
    fontWeight: '700',
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
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusActive: {
    color: '#10B981',
  },
  statusMuted: {
    color: '#6B7280',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FEF3C7',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
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
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  primaryGhost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
  },
  warningGhost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
  },
  dangerGhost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
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
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    marginTop: 16,
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
    backgroundColor: '#10B981',
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
});
