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
    ApplicationApiResponse
} from '@/types/applications.types';
import { offersService } from './offers.service';

class ApplicationsService {
    /**
     * Aplica a una oferta laboral
     * Solo disponible para usuarios tipo POSTULANTE
     */
    async applyToOffer(idOferta: string): Promise<Application> {
        console.log('📝 [APPLY] applyToOffer called with idOferta:', idOferta);
        const payload: CreateApplicationDTO = { idOferta };
        console.log('📝 [APPLY] Sending payload:', JSON.stringify(payload));
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
                            empresa: offer.empresa,
                            ciudad: offer.ciudad,
                            modalidad: offer.modalidad,
                        }
                    };
                } catch {
                    // Si la oferta ya no existe, retornar sin información
                    return {
                        ...app,
                        oferta: {
                            titulo: 'Oferta no disponible',
                            empresa: '-',
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
     * Obtiene las aplicaciones para una oferta con información de candidatos
     * Requiere llamadas adicionales al servicio de usuarios
     */
    async getOfferApplicationsWithCandidates(idOferta: string): Promise<ApplicationWithCandidate[]> {
        const applications = await this.getOfferApplications(idOferta);

        // Por ahora retornamos sin información adicional del candidato
        // TODO: Implementar llamada al servicio de usuarios cuando esté disponible
        const applicationsWithCandidates = applications.map(app => ({
            ...app,
            postulante: undefined // Se llenará cuando se implemente el endpoint
        }));

        return applicationsWithCandidates;
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
}

export const applicationsService = new ApplicationsService();

