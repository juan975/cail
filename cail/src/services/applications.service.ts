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
     * Obtiene TODAS las aplicaciones recibidas por el reclutador autenticado
     * Itera sobre todas las ofertas del reclutador y recopila las postulaciones
     */
    async getAllEmployerApplications(): Promise<{
        byOffer: { offer: { id: string; titulo: string }; applications: Application[] }[];
        total: number;
    }> {
        // 1. Obtener todas las ofertas del reclutador
        const myOffers = await offersService.getMyOffers();

        // 2. Para cada oferta, obtener las aplicaciones
        const byOffer = await Promise.all(
            myOffers.map(async (offer) => {
                try {
                    const applications = await this.getOfferApplications(offer.idOferta);
                    return {
                        offer: { id: offer.idOferta, titulo: offer.titulo },
                        applications
                    };
                } catch (error) {
                    console.warn(`Could not fetch applications for offer ${offer.idOferta}:`, error);
                    return {
                        offer: { id: offer.idOferta, titulo: offer.titulo },
                        applications: []
                    };
                }
            })
        );

        // 3. Calcular total
        const total = byOffer.reduce((sum, group) => sum + group.applications.length, 0);

        return { byOffer, total };
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
    async updateApplicationStatus(idAplicacion: string, status: 'ACEPTADA' | 'RECHAZADA'): Promise<void> {
        await apiService.patch(`/matching/postulacion/${idAplicacion}/status`, { estado: status });
    }
}

export const applicationsService = new ApplicationsService();

