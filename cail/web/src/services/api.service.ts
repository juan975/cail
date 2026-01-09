import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG } from './config';
import { ApiError } from '../types/auth.types';

const TOKEN_KEY = '@cail_auth_token';

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

        // Request interceptor - add auth token
        client.interceptors.request.use(
            async (config) => {
                const token = localStorage.getItem(TOKEN_KEY);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor - handle errors
        client.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
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
            // El matchingClient tiene baseURL que ya incluye /matching
            // Pero el backend tiene rutas montadas bajo /matching también
            // Por lo tanto NO hacemos strip del prefijo - la URL queda como /matching/*
            // Resultado: baseURL(/matching) + url(/matching/apply) = /matching/matching/apply
            // Esto es correcto según la estructura del backend
            return { client: this.matchingClient, cleanUrl: url };
        }
        // Default to usuarios for unknown paths (could be legacy or general)
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

    async delete<T>(url: string): Promise<T> {
        const { client, cleanUrl } = this.getClientForPath(url);
        const response = await client.delete<T>(cleanUrl);
        return response.data;
    }

    // User profile
    async getUserProfile<T>(): Promise<T> {
        const response = await this.usuariosClient.get<T>('/users/profile');
        return response.data;
    }

    // Token management
    async saveToken(token: string): Promise<void> {
        if (!token) {
            console.warn('Attempted to save null/undefined token');
            return;
        }
        localStorage.setItem(TOKEN_KEY, token);
    }

    async getToken(): Promise<string | null> {
        return localStorage.getItem(TOKEN_KEY);
    }

    async removeToken(): Promise<void> {
        localStorage.removeItem(TOKEN_KEY);
    }
}

export const apiService = new ApiService();
