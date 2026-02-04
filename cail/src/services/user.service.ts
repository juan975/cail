import { apiService } from './api.service';
import { API_CONFIG } from './config';
import { WorkExperience } from '@/types';

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
        sectorIndustrial?: string;
        resumenProfesional?: string;
        habilidadesTecnicas?: string[];
        softSkills?: string[];
        nivelEducacion?: string;
        titulo?: string;
        competencias?: string[];
        anosExperiencia?: string;
        resumenExperiencia?: string;
        experienciaLaboral?: WorkExperience[];
        cvUrl?: string;
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
        ruc?: string;
        tipoEmpresa?: string;
        ciudad?: string;
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

    /**
     * Upload CV (PDF file)
     */
    async uploadCV(file: FormData): Promise<{ cvUrl: string }> {
        const response = await apiService.postFormData<BackendApiResponse<{ cvUrl: string }>>(
            '/users/cv/upload',
            file
        );
        return response.data;
    }

    /**
     * Delete CV
     */
    async deleteCV(): Promise<void> {
        await apiService.delete('/users/cv');
    }
}

export const userService = new UserService();
