import { apiService } from './api.service';
import { API_CONFIG } from './config';

export interface UserProfile {
    idCuenta: string;
    email: string;
    nombreCompleto: string;
    telefono?: string;
    tipoUsuario: 'POSTULANTE' | 'RECLUTADOR' | 'ADMINISTRADOR';
    fechaRegistro: string;
    candidateProfile?: {
        cedula: string;
        fechaNacimiento?: string;
        direccion?: string;
        ciudad: string;
        resumenProfesional?: string;
        habilidadesTecnicas?: string[];
        nivelEducacion?: string;
        titulo?: string;
        competencias?: string[];
        anosExperiencia?: string;
        resumenExperiencia?: string;
    };
    employerProfile?: {
        nombreEmpresa: string;
        cargo: string;
        nombreContacto: string;
        industry?: string;
        numberOfEmployees?: string;
        description?: string;
        website?: string;
        address?: string;
    };
}

interface BackendApiResponse<T> {
    status: string;
    message: string;
    data: T;
}

class UserService {
    /**
     * Get current user's profile
     */
    async getProfile(): Promise<UserProfile> {
        const response = await apiService.getUserProfile<BackendApiResponse<UserProfile>>();
        return response.data;
    }

    /**
     * Update current user's profile
     */
    async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
        const response = await apiService.put<BackendApiResponse<UserProfile>>(
            API_CONFIG.ENDPOINTS.PROFILE,
            data
        );
        return response.data;
    }
}

export const userService = new UserService();
