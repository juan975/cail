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
        return response.data;
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
                            titulo: offer.titulo,
                            empresa: '', // Restricted for candidates
                            ciudad: offer.ciudad,
                            modalidad: offer.modalidad,
                            descripcion: offer.descripcion,
                            salarioMin: offer.salarioMin,
                            salarioMax: offer.salarioMax,
                            tipoContrato: offer.tipoContrato,
                            experiencia_requerida: offer.experiencia_requerida,
                            formacion_requerida: offer.formacion_requerida,
                            competencias_requeridas: offer.competencias_requeridas,
                            habilidades_obligatorias: offer.habilidades_obligatorias,
                            habilidades_deseables: offer.habilidades_deseables,
                            nivelJerarquico: offer.nivelJerarquico,
                        }
                    };
                } catch {
                    // Si la oferta ya no existe, retornar sin información
                    return {
                        ...app,
                        oferta: {
                            titulo: 'Oferta no disponible',
                            empresa: '',
                            ciudad: '-',
                            modalidad: '-',
                        }
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
        return response.data;
    }

    /**
     * Obtiene las aplicaciones para una oferta CON información de candidatos
     * Usa el endpoint enriquecido que ya incluye datos del candidato
     */
    async getOfferApplicationsWithCandidates(idOferta: string): Promise<ApplicationWithCandidate[]> {
        const response = await apiService.get<ApplicationApiResponse<ApplicationWithCandidate[]>>(
            `/matching/oferta/${idOferta}/applications-detailed`
        );
        return response.data;
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
