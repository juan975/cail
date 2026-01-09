import { useCallback, useEffect, useState } from 'react';
import { offersService } from '../../services/offers.service';
import { applicationsService } from '../../services/applications.service';
import { Offer, CreateOfferDTO, OfferStatus as ApiOfferStatus } from '../../types/offers.types';
import { Application, ApplicationStatusColors } from '../../types/applications.types';
import { colors } from '../../theme/colors';
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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
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
      setToast({ message: 'Oferta creada exitosamente', type: 'success' });
      setTimeout(() => setToast(null), 3000);
      loadOffers();
    } catch (error: any) {
      console.error('Error creating offer:', error);
      setToast({ message: error.message || 'Error al crear la oferta', type: 'error' });
      setTimeout(() => setToast(null), 5000);
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
      setToast({ message: 'Oferta actualizada exitosamente', type: 'success' });
      setTimeout(() => setToast(null), 3000);
      loadOffers();
    } catch (error: any) {
      console.error('Error updating offer:', error);
      setToast({ message: error.message || 'Error al actualizar la oferta', type: 'error' });
      setTimeout(() => setToast(null), 5000);
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
      setToast({ message: 'Acción realizada exitosamente', type: 'success' });
      setTimeout(() => setToast(null), 3000);
      loadOffers();
    } catch (error: any) {
      console.error('Error updating offer:', error);
      setToast({ message: error.message || 'Error al realizar la acción', type: 'error' });
      setTimeout(() => setToast(null), 5000);
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
      console.error('Error loading applications:', error);
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
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
      onClick={() => {
        setShowCreateModal(false);
        setShowEditModal(false);
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          width: 'min(720px, 92%)',
          maxHeight: '90vh',
          overflowY: 'auto',
          display: 'grid',
          gap: 12,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{titleLabel}</h3>
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
            <input
              value={newCompetency}
              onChange={(e) => setNewCompetency(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCompetency()}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #E5E7EB',
                fontSize: 14,
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={addCompetency}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: 'none',
                background: '#F1842D',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              Agregar
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
            {competencies.map((comp) => (
              <span key={comp} style={{ background: '#F3F4F6', padding: '6px 10px', borderRadius: 8, fontSize: 12 }}>
                {comp}
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
            style={{
              padding: '10px 16px',
              borderRadius: 12,
              border: '1px solid #E5E7EB',
              background: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            style={{
              padding: '10px 16px',
              borderRadius: 12,
              border: 'none',
              background: isSubmitting ? '#9CA3AF' : '#F1842D',
              color: '#fff',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: 600,
            }}
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
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ color: '#6B7280' }}>Cargando ofertas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ color: '#EF4444', marginBottom: 12 }}>{error}</div>
        <button
          type="button"
          onClick={loadOffers}
          style={{
            padding: '10px 16px',
            borderRadius: 12,
            border: 'none',
            background: '#F1842D',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 16, padding: '32px' }}>
      {/* Header */}
      <div
        style={{
          background: '#F1842D',
          borderRadius: 16,
          padding: 20,
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.2)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Gestión de ofertas</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>Controla tus publicaciones activas</div>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          style={{
            border: 'none',
            background: '#FFFFFF',
            color: '#F1842D',
            padding: '10px 16px',
            borderRadius: 12,
            cursor: 'pointer',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            fontWeight: 600,
          }}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva oferta
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedTab(tab.id)}
            style={{
              padding: '8px 14px',
              borderRadius: 999,
              border: `1px solid ${selectedTab === tab.id ? '#F1842D' : '#E5E7EB'}`,
              background: selectedTab === tab.id ? '#FFF7ED' : '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Offers */}
      {filteredOffers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB' }}>
          No hay ofertas para este estado.
        </div>
      ) : (
        filteredOffers.map((offer) => (
          <div key={offer.id} style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700 }}>{offer.title}</div>
                <div style={{ fontSize: 13, color: colors.textSecondary }}>{offer.department}</div>
              </div>
              <div style={{ fontSize: 12, color: colors.textSecondary }}>{offer.publishedDate}</div>
            </div>
            <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>{offer.description}</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, marginBottom: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {offer.location}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {offer.modality}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {offer.salary}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
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
                style={{
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: '1px solid #E5E7EB',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ver postulaciones
              </button>
              <button
                type="button"
                onClick={() => openEditModal(offer)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: '1px solid #E5E7EB',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
              {offer.status === 'active' && (
                <button
                  type="button"
                  onClick={() => setPendingAction({ type: 'archive', offer })}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid #F59E0B',
                    background: '#FFF7ED',
                    cursor: 'pointer',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pausar
                </button>
              )}
              {offer.status === 'archived' && (
                <button
                  type="button"
                  onClick={() => setPendingAction({ type: 'restore', offer })}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid #10B981',
                    background: '#ECFDF5',
                    cursor: 'pointer',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Reactivar
                </button>
              )}
              <button
                type="button"
                onClick={() => setPendingAction({ type: 'delete', offer })}
                style={{
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: '1px solid #FCA5A5',
                  background: '#FEF2F2',
                  cursor: 'pointer',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Cerrar
              </button>
            </div>
          </div>
        ))
      )}

      {showCreateModal && renderModal('Crear oferta', handleCreateOffer)}
      {showEditModal && renderModal('Editar oferta', handleUpdateOffer)}

      {pendingAction && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
          onClick={() => setPendingAction(null)}
        >
          <div
            style={{ background: '#fff', borderRadius: 16, padding: 20, width: 'min(420px, 90%)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 style={{ marginTop: 0 }}>Confirmar acción</h4>
            <div style={{ fontSize: 13, color: colors.textSecondary }}>
              ¿Deseas {pendingAction.type === 'archive' ? 'pausar' : pendingAction.type === 'restore' ? 'reactivar' : 'cerrar'} la
              oferta {pendingAction.offer.title}?
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: '1px solid #E5E7EB',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleOfferAction(pendingAction.type, pendingAction.offer)}
                disabled={isSubmitting}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: 'none',
                  background: isSubmitting ? '#9CA3AF' : '#F1842D',
                  color: '#fff',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? 'Procesando...' : 'Confirmar'}
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
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
          onClick={() => setShowApplicationsModal(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 24,
              width: 'min(720px, 92%)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
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
                    <div
                      key={app.idAplicacion}
                      style={{
                        background: '#fff',
                        borderRadius: 14,
                        padding: 14,
                        border: '1px solid #E5E7EB',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700 }}>{app.idPostulante}</div>
                        <div style={{ fontSize: 12, color: colors.textSecondary }}>
                          Aplicado: {new Date(app.fechaAplicacion).toLocaleDateString('es-EC')}
                        </div>
                      </div>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: 12,
                          background: statusInfo.bg,
                          color: statusInfo.text,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ textAlign: 'right', marginTop: 12 }}>
              <button
                type="button"
                onClick={() => setShowApplicationsModal(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: '1px solid #E5E7EB',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: toast.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            border: `1px solid ${toast.type === 'success' ? '#10B981' : '#EF4444'}`,
            borderRadius: 12,
            padding: '12px 16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 10000,
            maxWidth: '400px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={toast.type === 'success' ? '#10B981' : '#EF4444'}>
            {toast.type === 'success' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
          <span style={{ color: toast.type === 'success' ? '#065F46' : '#991B1B', fontWeight: 600, fontSize: 14 }}>
            {toast.message}
          </span>
        </div>
      )}
    </div>
  );
}
