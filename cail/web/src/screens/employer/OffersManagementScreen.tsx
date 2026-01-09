import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiAlertCircle, FiBriefcase, FiEdit, FiEye, FiPlusCircle, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { useResponsiveLayout } from '../../hooks/useResponsive';
import { offersService } from '../../services/offers.service';
import { applicationsService } from '../../services/applications.service';
import { Offer, CreateOfferDTO, OfferStatus as ApiOfferStatus } from '../../types/offers.types';
import { Application, ApplicationStatusColors } from '../../types/applications.types';
import { colors } from '../../theme/colors';
import { Card } from '../../components/ui/Card';
import { InputField } from '../../components/ui/InputField';
import { Button } from '../../components/ui/Button';

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
  apiId?: string;
  apiEstado?: ApiOfferStatus;
}

const mapApiStatusToUI = (estado: ApiOfferStatus): OfferStatus => {
  switch (estado) {
    case 'ACTIVA':
      return 'active';
    case 'PAUSADA':
    case 'CERRADA':
      return 'archived';
    default:
      return 'active';
  }
};

const mapUIStatusToApi = (status: OfferStatus): ApiOfferStatus => {
  switch (status) {
    case 'active':
      return 'ACTIVA';
    case 'archived':
      return 'PAUSADA';
    case 'deleted':
      return 'CERRADA';
    default:
      return 'ACTIVA';
  }
};

const mapApiOfferToUI = (offer: Offer): JobOffer => {
  const fechaPub = offer.fechaPublicacion instanceof Date ? offer.fechaPublicacion : new Date(offer.fechaPublicacion);

  return {
    id: offer.idOferta,
    apiId: offer.idOferta,
    title: offer.titulo,
    department: offer.empresa,
    description: offer.descripcion,
    location: offer.ciudad,
    salary:
      offer.salarioMin && offer.salarioMax
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
  const { contentWidth } = useResponsiveLayout();
  const [selectedTab, setSelectedTab] = useState<OfferStatus>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null);
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [pendingAction, setPendingAction] = useState<{ type: OfferAction; offer: JobOffer } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [selectedOfferApplications, setSelectedOfferApplications] = useState<Application[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [applicationsOffer, setApplicationsOffer] = useState<JobOffer | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
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

  const loadOffers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const apiOffers = await offersService.getMyOffers();
      setOffers(apiOffers.map(mapApiOfferToUI));
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

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDepartment('');
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

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (offer: JobOffer) => {
    setSelectedOffer(offer);
    setTitle(offer.title);
    setDescription(offer.description);
    setDepartment(offer.department);
    setSalaryMin('');
    setSalaryMax('');
    setModality(offer.modality);
    setLocation(offer.location);
    setCompetencies(offer.requiredCompetencies);
    setEducation(offer.requiredEducation);
    setExperiencia(offer.requiredExperience);
    setShowEditModal(true);
  };

  const handleCreateOffer = async () => {
    if (!title.trim() || !description.trim()) {
      window.alert('El título y la descripción son obligatorios');
      return;
    }

    try {
      setIsSubmitting(true);
        const createData: CreateOfferDTO = {
        titulo: title,
        descripcion: description,
        empresa: department,
        ciudad: location,
        salarioMin: salaryMin ? Number(salaryMin) : undefined,
        salarioMax: salaryMax ? Number(salaryMax) : undefined,
        modalidad: modality as any,
        tipoContrato: tipoContrato,
        competencias_requeridas: competencies,
        formacion_requerida: education[0] || '',
        experiencia_requerida: experiencia,
      };

      await offersService.createOffer(createData);
      setShowCreateModal(false);
      loadOffers();
    } catch (error: any) {
      window.alert(error.message || 'No se pudo crear la oferta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateOffer = async () => {
    if (!selectedOffer?.apiId) return;
    try {
      setIsSubmitting(true);
      await offersService.updateOffer(selectedOffer.apiId, {
        titulo: title,
        descripcion: description,
        empresa: department,
        ciudad: location,
        modalidad: modality as any,
        tipoContrato: tipoContrato,
        competencias_requeridas: competencies,
        formacion_requerida: education[0] || '',
        experiencia_requerida: experiencia,
      });
      setShowEditModal(false);
      loadOffers();
    } catch (error: any) {
      window.alert(error.message || 'No se pudo actualizar la oferta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOfferAction = async (action: OfferAction, offer: JobOffer) => {
    if (!offer.apiId) return;

    try {
      setIsSubmitting(true);
      if (action === 'archive') {
        await offersService.pauseOffer(offer.apiId);
      } else if (action === 'restore') {
        await offersService.activateOffer(offer.apiId);
      } else {
        await offersService.closeOffer(offer.apiId);
      }
      setPendingAction(null);
      loadOffers();
    } catch (error: any) {
      window.alert(error.message || 'No se pudo actualizar la oferta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadApplications = async (offer: JobOffer) => {
    if (!offer.apiId) return;
    setLoadingApplications(true);
    setApplicationsOffer(offer);
    try {
      const data = await applicationsService.getOfferApplications(offer.apiId);
      setSelectedOfferApplications(data);
      setShowApplicationsModal(true);
    } catch (error: any) {
      window.alert(error.message || 'No se pudieron cargar las postulaciones');
    } finally {
      setLoadingApplications(false);
    }
  };

  const addCompetency = () => {
    if (!newCompetency.trim()) return;
    setCompetencies((prev) => [...prev, newCompetency.trim()]);
    setNewCompetency('');
  };

  const addEducation = () => {
    if (!newEducation.trim()) return;
    setEducation((prev) => [...prev, newEducation.trim()]);
    setNewEducation('');
  };

  const renderModal = (titleLabel: string, onSubmit: () => void) => (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 40,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          padding: 24,
          width: 'min(720px, 92%)',
          maxHeight: '90vh',
          overflowY: 'auto',
          display: 'grid',
          gap: 12,
        }}
      >
        <h3 style={{ margin: 0 }}>{titleLabel}</h3>
        <InputField label="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
        <InputField label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} multiline />
        <InputField label="Empresa" value={department} onChange={(e) => setDepartment(e.target.value)} />
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <InputField label="Salario mínimo" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
          <InputField label="Salario máximo" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} />
        </div>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <InputField label="Modalidad" value={modality} onChange={(e) => setModality(e.target.value)} />
          <InputField label="Ubicación" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <InputField label="Tipo de contrato" value={tipoContrato} onChange={(e) => setTipoContrato(e.target.value)} />
        <InputField label="Experiencia requerida" value={experiencia} onChange={(e) => setExperiencia(e.target.value)} />
        <div>
          <label style={{ fontSize: 13, fontWeight: 600 }}>Competencias</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <InputField value={newCompetency} onChange={(e) => setNewCompetency(e.target.value)} />
            <Button label="Agregar" onPress={addCompetency} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
            {competencies.map((comp) => (
              <span key={comp} style={{ background: '#F3F4F6', padding: '6px 10px', borderRadius: 8, fontSize: 12 }}>
                {comp}
              </span>
            ))}
          </div>
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600 }}>Formación requerida</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <InputField value={newEducation} onChange={(e) => setNewEducation(e.target.value)} />
            <Button label="Agregar" onPress={addEducation} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
            {education.map((edu) => (
              <span key={edu} style={{ background: '#F3F4F6', padding: '6px 10px', borderRadius: 8, fontSize: 12 }}>
                {edu}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
            }}
            style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff' }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: '#F59E0B', color: '#fff' }}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );

  const statusTabs: { id: OfferStatus; label: string; count: number }[] = [
    { id: 'active', label: 'Activas', count: activeCount },
    { id: 'archived', label: 'Archivadas', count: archivedCount },
    { id: 'deleted', label: 'Retiradas', count: deletedCount },
  ];

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <FiBriefcase size={32} color="#F59E0B" />
        <div style={{ color: '#6B7280', marginTop: 12 }}>Cargando ofertas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <FiAlertCircle size={36} color="#EF4444" />
        <div style={{ marginTop: 12, color: '#EF4444' }}>{error}</div>
        <button
          type="button"
          onClick={loadOffers}
          style={{ marginTop: 16, padding: '10px 16px', borderRadius: 10, border: 'none', background: '#F59E0B', color: '#fff' }}
        >
          <FiRefreshCw /> Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: contentWidth, margin: '0 auto' }}>
      <Card spacing="lg" style={{ background: '#FFF7ED', border: '1px solid #FDE68A' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Gestión de ofertas</div>
            <div style={{ fontSize: 13, color: colors.textSecondary }}>Controla tus publicaciones activas</div>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            style={{
              border: 'none',
              background: '#F59E0B',
              color: '#fff',
              padding: '10px 14px',
              borderRadius: 12,
              cursor: 'pointer',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <FiPlusCircle /> Nueva oferta
          </button>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedTab(tab.id)}
            style={{
              padding: '8px 14px',
              borderRadius: 999,
              border: `1px solid ${selectedTab === tab.id ? '#F59E0B' : '#E5E7EB'}`,
              background: selectedTab === tab.id ? '#FFF7ED' : '#fff',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {filteredOffers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, background: '#fff', borderRadius: 12 }}>
          No hay ofertas para este estado.
        </div>
      ) : (
        filteredOffers.map((offer) => (
          <Card key={offer.id} style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700 }}>{offer.title}</div>
                <div style={{ fontSize: 13, color: colors.textSecondary }}>{offer.department}</div>
              </div>
              <div style={{ fontSize: 12, color: colors.textSecondary }}>{offer.publishedDate}</div>
            </div>
            <div style={{ fontSize: 13, color: colors.textSecondary }}>{offer.description}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12 }}>
              <span>{offer.location}</span>
              <span>{offer.modality}</span>
              <span>{offer.salary}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {offer.requiredCompetencies.slice(0, 3).map((comp) => (
                <span key={comp} style={{ background: '#F3F4F6', padding: '4px 8px', borderRadius: 8, fontSize: 12 }}>
                  {comp}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => loadApplications(offer)}
                style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer' }}
              >
                <FiEye /> Ver postulaciones
              </button>
              <button
                type="button"
                onClick={() => openEditModal(offer)}
                style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer' }}
              >
                <FiEdit /> Editar
              </button>
              {offer.status === 'active' && (
                <button
                  type="button"
                  onClick={() => setPendingAction({ type: 'archive', offer })}
                  style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #F59E0B', background: '#FFF7ED', cursor: 'pointer' }}
                >
                  Pausar
                </button>
              )}
              {offer.status === 'archived' && (
                <button
                  type="button"
                  onClick={() => setPendingAction({ type: 'restore', offer })}
                  style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #10B981', background: '#ECFDF5', cursor: 'pointer' }}
                >
                  Reactivar
                </button>
              )}
              <button
                type="button"
                onClick={() => setPendingAction({ type: 'delete', offer })}
                style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #FCA5A5', background: '#FEF2F2', cursor: 'pointer' }}
              >
                <FiTrash2 /> Cerrar
              </button>
            </div>
          </Card>
        ))
      )}

      {showCreateModal && renderModal('Crear oferta', handleCreateOffer)}
      {showEditModal && renderModal('Editar oferta', handleUpdateOffer)}

      {pendingAction && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 40,
          }}
        >
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, width: 'min(420px, 90%)' }}>
            <h4 style={{ marginTop: 0 }}>Confirmar acción</h4>
            <div style={{ fontSize: 13, color: colors.textSecondary }}>
              ¿Deseas {pendingAction.type === 'archive' ? 'pausar' : pendingAction.type === 'restore' ? 'reactivar' : 'cerrar'} la oferta {pendingAction.offer.title}?
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleOfferAction(pendingAction.type, pendingAction.offer)}
                style={{ padding: '8px 14px', borderRadius: 10, border: 'none', background: '#F59E0B', color: '#fff' }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {showApplicationsModal && applicationsOffer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 40,
          }}
        >
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, width: 'min(720px, 92%)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>Postulaciones - {applicationsOffer.title}</h3>
            {loadingApplications ? (
              <div>Cargando postulaciones...</div>
            ) : selectedOfferApplications.length === 0 ? (
              <div>No hay postulaciones para esta oferta.</div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {selectedOfferApplications.map((app) => {
                  const statusInfo = ApplicationStatusColors[app.estado];
                  return (
                    <Card key={app.idAplicacion} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{app.idPostulante}</div>
                        <div style={{ fontSize: 12, color: colors.textSecondary }}>Aplicado: {new Date(app.fechaAplicacion).toLocaleDateString('es-EC')}</div>
                      </div>
                      <span style={{ padding: '4px 8px', borderRadius: 12, background: statusInfo.bg, color: statusInfo.text, fontSize: 11, fontWeight: 600 }}>
                        {statusInfo.label}
                      </span>
                    </Card>
                  );
                })}
              </div>
            )}
            <div style={{ textAlign: 'right', marginTop: 12 }}>
              <button
                type="button"
                onClick={() => setShowApplicationsModal(false)}
                style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
