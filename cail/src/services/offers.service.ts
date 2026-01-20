/**
 * Servicio de Ofertas
 * Encapsula las llamadas al microservicio de ofertas
 */

import { apiService } from './api.service';
import {
    Offer,
    CreateOfferDTO,
    UpdateOfferDTO,
    OfferFilters,
    OfferApiResponse
} from '@/types/offers.types';

class OffersService {
    /**
     * Obtiene todas las ofertas con filtros opcionales
     */
    async getOffers(filters?: OfferFilters): Promise<Offer[]> {
        let url = '/offers';

        if (filters) {
            const params = new URLSearchParams();
            if (filters.estado) params.append('estado', filters.estado);
            if (filters.ciudad) params.append('ciudad', filters.ciudad);
            if (filters.modalidad) params.append('modalidad', filters.modalidad);
            if (filters.limit) params.append('limit', filters.limit.toString());

            const queryString = params.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        }

        const response = await apiService.get<OfferApiResponse<Offer[]>>(url);
        console.log('📋 [OFFERS] API returned offers count:', response.data?.length);
        if (response.data?.length > 0) {
            console.log('📋 [OFFERS] First offer sample:', JSON.stringify(response.data[0], null, 2));
            console.log('📋 [OFFERS] First offer idOferta:', response.data[0].idOferta);
        }
        return response.data;
    }

    /**
     * Obtiene una oferta por ID
     */
    async getOfferById(id: string): Promise<Offer> {
        const response = await apiService.get<OfferApiResponse<Offer>>(`/offers/${id}`);
        return response.data;
    }

    /**
     * Crea una nueva oferta (solo reclutadores)
     */
    async createOffer(data: CreateOfferDTO): Promise<Offer> {
        const response = await apiService.post<OfferApiResponse<Offer>>('/offers', data);
        return response.data;
    }

    /**
     * Actualiza una oferta existente
     */
    async updateOffer(id: string, data: UpdateOfferDTO): Promise<Offer> {
        const response = await apiService.put<OfferApiResponse<Offer>>(`/offers/${id}`, data);
        return response.data;
    }

    /**
     * Elimina una oferta
     */
    async deleteOffer(id: string): Promise<void> {
        await apiService.delete<OfferApiResponse<null>>(`/offers/${id}`);
    }

    /**
     * Obtiene las ofertas del reclutador autenticado
     */
    async getMyOffers(): Promise<Offer[]> {
        const response = await apiService.get<OfferApiResponse<Offer[]>>('/offers/my-offers');
        return response.data;
    }

    /**
     * Pausa una oferta (cambia estado a PAUSADA)
     */
    async pauseOffer(id: string): Promise<Offer> {
        return this.updateOffer(id, { estado: 'PAUSADA' });
    }

    /**
     * Reactiva una oferta (cambia estado a ACTIVA)
     */
    async activateOffer(id: string): Promise<Offer> {
        return this.updateOffer(id, { estado: 'ACTIVA' });
    }

    /**
     * Cierra una oferta (cambia estado a CERRADA)
     */
    async closeOffer(id: string): Promise<Offer> {
        return this.updateOffer(id, { estado: 'CERRADA' });
    }
}

export const offersService = new OffersService();
