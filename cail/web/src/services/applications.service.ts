/**
 * Servicio de Aplicaciones/Postulaciones
 * Encapsula las llamadas al microservicio de matching para gestión de aplicaciones
 * 
 * NOTA: Las rutas usan /matching/* porque el apiService.getClientForPath 
 * detecta este prefijo para usar el matchingClient. El baseURL del matchingClient
 * ya es /matching, por lo que las rutas completas serán /matching/matching/*.
 * Esto es correcto según la estructura del backend donde las rutas están 
 * montadas bajo /matching en el router.
 */

import { apiService } from './api.service';
import {
    Application,
    ApplicationWithOffer,
    ApplicationWithCandidate,
    CreateApplicationDTO,
    ApplicationApiResponse,
    ApplicationStatus
} from '../types/applications.types';
import { offersService } from './offers.service';

class ApplicationsService {
    /**
     * Aplica a una oferta laboral
     * Solo disponible para usuarios tipo POSTULANTE
     */
    async applyToOffer(idOferta: string): Promise<Application> {
        const payload: CreateApplicationDTO = { idOferta };
        const response = await apiService.post<ApplicationApiResponse<Application>>(
            '/matching/apply',
            payload
        );
        return response.data;
    }

    /**
     * Obtiene las aplicaciones del usuario autenticado (candidato)
     */
    async getMyApplications(): Promise<Application[]> {
        const response = await apiService.get<ApplicationApiResponse<Application[]>>(
            '/matching/applications'
        );
        return response?.data || [];
    }

    /**
     * Obtiene las aplicaciones del usuario con información de las ofertas
     * Realiza llamadas adicionales para enriquecer los datos
     */
    async getMyApplicationsWithOffers(): Promise<ApplicationWithOffer[]> {
        const applications = await this.getMyApplications();

        // Obtener información de cada oferta
        const applicationsWithOffers = await Promise.all(
            applications.map(async (app) => {
                try {
                    const offer = await offersService.getOfferById(app.idOferta);
                    return {
                        ...app,
                        oferta: {
                            ...offer,
                            empresa: '', // Restricted for candidates
                        }
                    };
                } catch (error: any) {
                    console.warn(`Could not load offer ${app.idOferta} for application ${app.idAplicacion}:`, error);
                    // Si la oferta ya no existe (404) o el servicio falla, retornar sin información
                    return {
                        ...app,
                        oferta: {
                            id: app.idOferta, // Mantener el ID original
                            title: 'Oferta no disponible',
                            company: '',
                            description: 'Esta oferta ya no está disponible o fue eliminada',
                            location: '-',
                            modality: '-',
                            salaryRange: '-',
                            employmentType: '-',
                            industry: '-',
                            hierarchyLevel: '-',
                            requiredCompetencies: [],
                            requiredExperience: '-',
                            requiredEducation: '-',
                            professionalArea: '-',
                            economicSector: '-',
                            experienceLevel: '-',
                            postedDate: '-',
                            technicalSkills: []
                        } as any // Cast temporal para evitar problemas de tipos con campos faltantes
                    };
                }
            })
        );

        return applicationsWithOffers;
    }

    /**
     * Obtiene las aplicaciones para una oferta específica (reclutador)
     */
    async getOfferApplications(idOferta: string): Promise<Application[]> {
        const response = await apiService.get<ApplicationApiResponse<Application[]>>(
            `/matching/oferta/${idOferta}/applications`
        );
        return response?.data || [];
    }

    /**
     * Obtiene las aplicaciones para una oferta CON información de candidatos
     * Usa el endpoint enriquecido que ya incluye datos del candidato
     */
    async getOfferApplicationsWithCandidates(idOferta: string): Promise<ApplicationWithCandidate[]> {
        const response = await apiService.get<ApplicationApiResponse<ApplicationWithCandidate[]>>(
            `/matching/oferta/${idOferta}/applications-detailed`
        );
        return response?.data || [];
    }

    /**
     * Verifica si el usuario ya aplicó a una oferta específica
     * Útil para mostrar el estado en las tarjetas de ofertas
     */
    async hasAppliedToOffer(idOferta: string): Promise<boolean> {
        try {
            const applications = await this.getMyApplications();
            return applications.some(app => app.idOferta === idOferta);
        } catch {
            return false;
        }
    }

    /**
     * Obtiene un mapa de ofertas a las que el usuario ya aplicó
     * Útil para marcar múltiples ofertas en una lista
     */
    async getAppliedOffersMap(): Promise<Map<string, Application>> {
        try {
            const applications = await this.getMyApplications();
            const map = new Map<string, Application>();
            applications.forEach(app => {
                map.set(app.idOferta, app);
            });
            return map;
        } catch {
            return new Map();
        }
    }

    /**
     * Actualiza el estado de una aplicación (Reclutador)
     */
    async updateApplicationStatus(idAplicacion: string, status: ApplicationStatus): Promise<void> {
        await apiService.patch(`/matching/postulacion/${idAplicacion}/status`, { estado: status });
    }
}

export const applicationsService = new ApplicationsService();
