import { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useResponsiveLayout } from '@/hooks/useResponsive';

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
}

const mockOffers: JobOffer[] = [
  {
    id: '1',
    title: 'Ingeniero de Producción',
    department: 'Producción',
    description: 'Responsable de supervisar procesos de manufactura y optimización de líneas de producción.',
    location: 'Loja',
    salary: '$1200 - $1800',
    modality: 'Presencial',
    priority: 'Alta',
    publishedDate: '10/10/2025',
    status: 'active',
    applications: 12,
    views: 45,
    requiredCompetencies: ['Gestión de procesos', 'Liderazgo'],
    requiredEducation: ['Ingeniería Industrial'],
    requiredExperience: '3 años en producción',
  },
];

export function OffersManagementScreen() {
  const { isDesktop, contentWidth, horizontalGutter } = useResponsiveLayout();
  const [selectedTab, setSelectedTab] = useState<OfferStatus>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null);
  const [offers, setOffers] = useState<JobOffer[]>(mockOffers);
  const [pendingAction, setPendingAction] = useState<{ type: OfferAction; offer: JobOffer } | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [priority, setPriority] = useState('Media');
  const [salary, setSalary] = useState('');
  const [modality, setModality] = useState('Presencial');
  const [location, setLocation] = useState('Loja');
  const [competencies, setCompetencies] = useState<string[]>([]);
  const [newCompetency, setNewCompetency] = useState('');
  const [education, setEducation] = useState<string[]>([]);
  const [newEducation, setNewEducation] = useState('');

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
    setShowEditModal(true);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDepartment('');
    setPriority('Media');
    setSalary('');
    setModality('Presencial');
    setLocation('Loja');
    setCompetencies([]);
    setEducation([]);
    setNewCompetency('');
    setNewEducation('');
  };

  const handleCreateOffer = () => {
    const newOffer: JobOffer = {
      id: Date.now().toString(),
      title,
      department,
      description,
      location,
      salary,
      modality,
      priority,
      publishedDate: new Date().toLocaleDateString('es-EC'),
      status: 'active',
      applications: 0,
      views: 0,
      requiredCompetencies: competencies,
      requiredEducation: education,
      requiredExperience: '',
    };
    setOffers([...offers, newOffer]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleUpdateOffer = () => {
    if (!selectedOffer) return;
    const updated = offers.map((offer) =>
      offer.id === selectedOffer.id ? { ...offer, title, description, salary, modality, location } : offer,
    );
    setOffers(updated);
    setShowEditModal(false);
    setSelectedOffer(null);
  };

  const requestOfferAction = (action: OfferAction, offer: JobOffer) => setPendingAction({ type: action, offer });
  const closeActionModal = () => setPendingAction(null);

  const handleActionConfirm = () => {
    if (!pendingAction) return;
    const { type, offer } = pendingAction;
    setOffers((prev) =>
      prev.map((item) => {
        if (item.id !== offer.id) return item;
        if (type === 'archive') return { ...item, status: 'archived' };
        if (type === 'restore') return { ...item, status: 'active' };
        return { ...item, status: 'deleted' };
      }),
    );
    setSelectedTab(type === 'archive' ? 'archived' : type === 'restore' ? 'active' : 'deleted');
    setPendingAction(null);
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

      {/* Modales */}
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
              modality={modality}
              location={location}
              competencies={competencies}
              education={education}
              newCompetency={newCompetency}
              newEducation={newEducation}
              setTitle={setTitle}
              setDescription={setDescription}
              setDepartment={setDepartment}
              setSalary={setSalary}
              setModality={setModality}
              setLocation={setLocation}
              setNewCompetency={setNewCompetency}
              setNewEducation={setNewEducation}
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
            <TouchableOpacity style={styles.submitButton} onPress={handleCreateOffer}>
              <Text style={styles.submitText}>Publicar Oferta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
              modality={modality}
              location={location}
              competencies={competencies}
              education={education}
              newCompetency={newCompetency}
              newEducation={newEducation}
              setTitle={setTitle}
              setDescription={setDescription}
              setDepartment={setDepartment}
              setSalary={setSalary}
              setModality={setModality}
              setLocation={setLocation}
              setNewCompetency={setNewCompetency}
              setNewEducation={setNewEducation}
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
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateOffer}>
                <Text style={styles.saveText}>Guardar Cambios</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
                    style={[styles.dialogConfirm, { backgroundColor: actionDetails.confirmColor }]}
                    onPress={handleActionConfirm}
                  >
                    <Text style={styles.dialogConfirmText}>Confirmar</Text>
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
  modality,
  location,
  competencies,
  education,
  newCompetency,
  newEducation,
  setTitle,
  setDescription,
  setDepartment,
  setSalary,
  setModality,
  setLocation,
  setNewCompetency,
  setNewEducation,
  addCompetency,
  addEducation,
  removeCompetency,
  removeEducation,
}: {
  title: string;
  description: string;
  department: string;
  salary: string;
  modality: string;
  location: string;
  competencies: string[];
  education: string[];
  newCompetency: string;
  newEducation: string;
  setTitle: (v: string) => void;
  setDescription: (v: string) => void;
  setDepartment: (v: string) => void;
  setSalary: (v: string) => void;
  setModality: (v: string) => void;
  setLocation: (v: string) => void;
  setNewCompetency: (v: string) => void;
  setNewEducation: (v: string) => void;
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
        <Text style={styles.label}>Departamento</Text>
        <TextInput
          style={styles.input}
          value={department}
          onChangeText={setDepartment}
          placeholder="Ej: Producción, Administración"
          placeholderTextColor="#9CA3AF"
        />
      </View>
      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>Rango Salarial</Text>
          <TextInput
            style={styles.input}
            value={salary}
            onChangeText={setSalary}
            placeholder="$1000 - $1500"
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>Modalidad</Text>
          <View style={styles.selectContainer}>
            <Text style={styles.selectText}>{modality}</Text>
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
    marginBottom: 8,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#D1FAE5',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusActive: {
    color: '#059669',
  },
  statusMuted: {
    color: '#6B7280',
  },
  priorityBadge: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
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
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    color: '#6B7280',
    fontSize: 13,
  },
  offerActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionText: {
    fontWeight: '700',
    fontSize: 14,
  },
  primaryGhost: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#10B981',
    backgroundColor: '#ECFDF3',
  },
  warningGhost: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F59E0B',
    backgroundColor: '#FFF7E6',
  },
  dangerGhost: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  deletedTag: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  deletedTagText: {
    color: '#B91C1C',
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  selectText: {
    fontSize: 14,
    color: '#1F2937',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  flex1: {
    flex: 1,
  },
  addInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#F59E0B',
    width: 44,
    height: 44,
    borderRadius: 10,
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
    backgroundColor: '#F3F4F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
  },
  modalOverlayDesktop: {
    justifyContent: 'center',
    paddingVertical: 24,
  },
  modalOverlayMobile: {
    justifyContent: 'flex-end',
    paddingVertical: 12,
    paddingBottom: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '92%',
    alignSelf: 'center',
    shadowColor: '#0F172A',
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
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  modalForm: {
    maxHeight: 420,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  cancelText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  dialogDescription: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 12,
  },
  dialogBullets: {
    gap: 8,
    marginBottom: 12,
  },
  dialogBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  dialogDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    marginTop: 6,
  },
  dialogBulletText: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
  },
  dialogWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  dialogWarningText: {
    flex: 1,
    fontSize: 13,
    color: '#B91C1C',
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  dialogCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  dialogCancelText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '700',
  },
  dialogConfirm: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  dialogConfirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
