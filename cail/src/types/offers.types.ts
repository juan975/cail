/**
 * Tipos para el módulo de Ofertas
 * Sincronizado con la entidad Oferta del backend
 */

export type OfferStatus = 'ACTIVA' | 'CERRADA' | 'PAUSADA';
export type HierarchyLevel = 'Junior' | 'Semi-Senior' | 'Senior' | 'Gerencial';

export interface Offer {
    idOferta: string;
    titulo: string;
    descripcion: string;
    empresa: string;
    ciudad: string;
    modalidad: string;
    tipoContrato: string;
    salarioMin?: number;
    salarioMax?: number;
    experiencia_requerida?: string;
    formacion_requerida?: string;
    competencias_requeridas: string[];
    nivelJerarquico?: HierarchyLevel;
    fechaPublicacion: Date | string;
    fechaCierre?: Date | string;
    estado: OfferStatus;
    idReclutador: string;
}

export interface CreateOfferDTO {
    titulo: string;
    descripcion: string;
    empresa: string;
    ciudad: string;
    modalidad: string;
    tipoContrato: string;
    salarioMin?: number;
    salarioMax?: number;
    experiencia_requerida?: string;
    formacion_requerida?: string;
    competencias_requeridas: string[];
    nivelJerarquico?: HierarchyLevel;
    fechaCierre?: Date | string;
}

export interface UpdateOfferDTO extends Partial<CreateOfferDTO> {
    estado?: OfferStatus;
}

export interface OfferFilters {
    estado?: OfferStatus;
    ciudad?: string;
    modalidad?: string;
    limit?: number;
}

export interface OfferApiResponse<T> {
    status: 'success' | 'error';
    data: T;
    message?: string;
}

