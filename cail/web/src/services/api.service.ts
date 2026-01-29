/**
 * Servicio de API - Cliente HTTP para comunicación con microservicios
 * 
 * Actualizado para usar Firebase ID Tokens en lugar de JWT custom.
 * Los tokens se obtienen automáticamente de Firebase Auth.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG } from './config';
import { ApiError } from '../types/auth.types';

class ApiService {
    private usuariosClient: AxiosInstance;
    private ofertasClient: AxiosInstance;
    private matchingClient: AxiosInstance;

    constructor() {
        this.usuariosClient = this.createClient(API_CONFIG.SERVICES.USUARIOS);
        this.ofertasClient = this.createClient(API_CONFIG.SERVICES.OFERTAS);
        this.matchingClient = this.createClient(API_CONFIG.SERVICES.MATCHING);
    }

    private createClient(baseURL: string): AxiosInstance {
        const client = axios.create({
            baseURL,
            timeout: API_CONFIG.TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor - obtener Firebase ID Token automáticamente
        client.interceptors.request.use(
            async (config) => {
                try {
                    // Importar dinámicamente para evitar dependencias circulares
                    const { firebaseAuthService } = await import('./firebase.service');
                    const token = await firebaseAuthService.getIdToken();

                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                } catch (error) {
                    // Si no hay usuario autenticado, continuar sin token
                    console.debug('No auth token available');
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor - handle errors
        client.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                // LOG DETALLADO DEL ERROR DEL BACKEND
                if (error.response?.data) {
                    console.error('🔴 API Error Response Body:', JSON.stringify(error.response.data, null, 2));
                }

                const apiError: ApiError = {
                    status: error.response?.status || 500,
                    message: this.getErrorMessage(error),
                    details: error.response?.data,
                };
                return Promise.reject(apiError);
            }
        );

        return client;
    }

    private getClientForPath(url: string): { client: AxiosInstance; cleanUrl: string } {
        if (url.startsWith('/auth') || url.startsWith('/users')) {
            return { client: this.usuariosClient, cleanUrl: url };
        }
        if (url.startsWith('/offers')) {
            return { client: this.ofertasClient, cleanUrl: url };
        }
        if (url.startsWith('/matching')) {
            // Keep the full URL - proxy needs /matching prefix to route correctly
            return { client: this.matchingClient, cleanUrl: url };
        }
        // Default to usuarios for unknown paths
        return { client: this.usuariosClient, cleanUrl: url };
    }

    private getErrorMessage(error: AxiosError): string {
        if (error.response?.data && typeof error.response.data === 'object') {
            const data = error.response.data as any;
            return data.message || data.error || 'Error en la solicitud';
        }

        if (error.code === 'ECONNABORTED') {
            return 'Tiempo de espera agotado. Verifica tu conexión.';
        }

        if (error.code === 'ERR_NETWORK') {
            return 'Error de red. Verifica tu conexión a internet.';
        }

        return error.message || 'Error desconocido';
    }

    async get<T>(url: string): Promise<T> {
        const { client, cleanUrl } = this.getClientForPath(url);
        const response = await client.get<T>(cleanUrl);
        return response.data;
    }

    async post<T>(url: string, data?: any): Promise<T> {
        const { client, cleanUrl } = this.getClientForPath(url);
        const response = await client.post<T>(cleanUrl, data);
        return response.data;
    }

    async put<T>(url: string, data?: any): Promise<T> {
        const { client, cleanUrl } = this.getClientForPath(url);
        const response = await client.put<T>(cleanUrl, data);
        return response.data;
    }

    async patch<T>(url: string, data?: any): Promise<T> {
        const { client, cleanUrl } = this.getClientForPath(url);
        const response = await client.patch<T>(cleanUrl, data);
        return response.data;
    }

    async delete<T>(url: string): Promise<T> {
        const { client, cleanUrl } = this.getClientForPath(url);
        const response = await client.delete<T>(cleanUrl);
        return response.data;
    }

    async postFormData<T>(url: string, formData: FormData): Promise<T> {
        // Obtener token de Firebase
        const { firebaseAuthService } = await import('./firebase.service');
        const token = await firebaseAuthService.getIdToken();

        // URL directa de la Cloud Function
        const CLOUD_FUNCTION_URL = 'https://us-central1-cail-backend-prod.cloudfunctions.net/usuarios';

        // Usar fetch nativo para FormData
        const response = await fetch(`${CLOUD_FUNCTION_URL}${url}`, {
            method: 'POST',
            body: formData,
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('🔴 API FormData Error:', JSON.stringify(errorData, null, 2));
            throw {
                status: response.status,
                message: errorData.message || 'Error al subir archivo',
            };
        }

        return response.json();
    }

    // User profile
    async getUserProfile<T>(): Promise<T> {
        const response = await this.usuariosClient.get<T>('/users/profile');
        return response.data;
    }

    // =========================================
    // DEPRECATED - Ya no se usan con Firebase Auth
    // Mantenidos por compatibilidad temporal
    // =========================================

    /** @deprecated Firebase Auth maneja los tokens automáticamente */
    async saveToken(token: string): Promise<void> {
        console.warn('saveToken is deprecated. Firebase Auth handles tokens automatically.');
    }

    /** @deprecated Use firebaseAuthService.getIdToken() instead */
    async getToken(): Promise<string | null> {
        const { firebaseAuthService } = await import('./firebase.service');
        return await firebaseAuthService.getIdToken();
    }

    /** @deprecated Use firebaseAuthService.logout() instead */
    async removeToken(): Promise<void> {
        console.warn('removeToken is deprecated. Use firebaseAuthService.logout() instead.');
    }
}

export const apiService = new ApiService();
