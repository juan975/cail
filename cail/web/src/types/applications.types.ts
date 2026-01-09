/**
 * Tipos para el módulo de Aplicaciones/Postulaciones
 * Sincronizado con la entidad Aplicacion del microservicio matching
 */

export type ApplicationStatus = 'PENDIENTE' | 'EN_REVISION' | 'ACEPTADA' | 'RECHAZADA';

/**
 * Representa una aplicación/postulación a una oferta laboral
 */
export interface Application {
    idAplicacion: string;
    idPostulante: string;
    idOferta: string;
    fechaAplicacion: Date | string;
    estado: ApplicationStatus;
    matchScore?: number;
    updatedAt?: Date | string;
}

/**
 * DTO para crear una nueva aplicación
 */
export interface CreateApplicationDTO {
    idOferta: string;
}

/**
 * Aplicación con información de la oferta incluida
 * Útil para mostrar en la lista de "Mis Aplicaciones"
 */
export interface ApplicationWithOffer extends Application {
    oferta?: {
        titulo: string;
        empresa: string;
        ciudad: string;
        modalidad: string;
    };
}

/**
 * Aplicación con información del postulante incluida
 * Útil para mostrar en la vista del reclutador
 */
export interface ApplicationWithCandidate extends Application {
    postulante?: {
        nombreCompleto: string;
        email: string;
        telefono?: string;
    };
}

/**
 * Respuesta estándar del API de aplicaciones
 */
export interface ApplicationApiResponse<T> {
    status: 'success' | 'error';
    data: T;
    message?: string;
}

/**
 * Mapeo de colores para los estados de aplicación
 */
export const ApplicationStatusColors: Record<ApplicationStatus, { bg: string; text: string; label: string }> = {
    'PENDIENTE': { bg: '#FEF3C7', text: '#92400E', label: 'Pendiente' },
    'EN_REVISION': { bg: '#DBEAFE', text: '#1E40AF', label: 'En Revisión' },
    'ACEPTADA': { bg: '#D1FAE5', text: '#065F46', label: 'Aceptada' },
    'RECHAZADA': { bg: '#FEE2E2', text: '#991B1B', label: 'Rechazada' },
};
